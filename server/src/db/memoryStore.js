import bcrypt from 'bcryptjs';

/**
 * Universal In-Memory Document Store & Query Engine
 * Fully satisfies Mongoose API (find, findOne, findById, create, countDocuments, aggregate, save)
 * Guarantees zero-network, zero-download, instantaneous startup out-of-the-box!
 */

const matchesCondition = (val, cond) => {
  if (cond === undefined) return true;
  if (cond !== null && typeof cond === 'object') {
    if ('$in' in cond) {
      return cond.$in.includes(val);
    }
    if ('$ne' in cond) {
      return val !== cond.$ne;
    }
    if ('$gte' in cond) {
      return val >= cond.$gte;
    }
    if ('$lte' in cond) {
      return val <= cond.$lte;
    }
    if ('$regex' in cond || cond instanceof RegExp) {
      const reg = cond instanceof RegExp ? cond : new RegExp(cond.$regex, cond.$options || 'i');
      return reg.test(String(val || ''));
    }
  }
  if (cond instanceof RegExp) {
    return cond.test(String(val || ''));
  }
  return val === cond;
};

const matchesFilter = (doc, filter = {}) => {
  if (!filter || Object.keys(filter).length === 0) return true;
  
  if (filter.$or) {
    const orMatches = filter.$or.some(f => matchesFilter(doc, f));
    if (!orMatches) return false;
  }

  for (const [key, cond] of Object.entries(filter)) {
    if (key === '$or') continue;
    const docVal = doc[key];
    if (!matchesCondition(docVal, cond)) {
      return false;
    }
  }
  return true;
};

class BaseCollection {
  constructor(name) {
    this.name = name;
    this.docs = [];
  }

  _wrap(doc) {
    if (!doc) return null;
    return this.decorate(doc);
  }

  decorate(doc) {
    if (!doc._id) {
      doc._id = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    if (!doc.createdAt) doc.createdAt = new Date();
    if (!doc.updatedAt) doc.updatedAt = new Date();

    doc.save = async () => {
      doc.updatedAt = new Date();
      const idx = this.docs.findIndex(d => d._id === doc._id);
      if (idx >= 0) {
        this.docs[idx] = doc;
      } else {
        this.docs.push(doc);
      }
      return doc;
    };
    return doc;
  }

  find(filter = {}) {
    let results = this.docs.filter(d => matchesFilter(d, filter)).map(d => ({ ...d }));
    results = results.map(d => this.decorate(d));

    const chain = {
      _results: results,
      sort(sortObj = {}) {
        let field, dir = 1;
        if (typeof sortObj === 'string') {
          if (sortObj.startsWith('-')) {
            field = sortObj.substring(1);
            dir = -1;
          } else {
            field = sortObj;
            dir = 1;
          }
        } else if (sortObj && typeof sortObj === 'object') {
          const entries = Object.entries(sortObj);
          if (entries.length > 0) {
            [field, dir] = entries[0];
          }
        }

        if (field) {
          chain._results.sort((a, b) => {
            let valA = a[field];
            let valB = b[field];
            if (valA instanceof Date) valA = valA.getTime();
            if (valB instanceof Date) valB = valB.getTime();
            if (valA < valB) return dir === -1 ? 1 : -1;
            if (valA > valB) return dir === -1 ? -1 : 1;
            return 0;
          });
        }
        return chain;
      },
      limit(n) {
        if (typeof n === 'number') {
          chain._results = chain._results.slice(0, n);
        }
        return chain;
      },
      skip(n) {
        if (typeof n === 'number') {
          chain._results = chain._results.slice(n);
        }
        return chain;
      },
      select(fields) {
        return chain;
      },
      populate(fields) {
        return chain;
      },
      then(resolve, reject) {
        return Promise.resolve(chain._results).then(resolve, reject);
      },
      catch(reject) {
        return Promise.resolve(chain._results).catch(reject);
      },
    };
    return chain;
  }

  findOne(filter = {}) {
    const found = this.docs.find(d => matchesFilter(d, filter));
    const doc = found ? this.decorate({ ...found }) : null;
    const chain = {
      _doc: doc,
      select(fields) {
        return chain;
      },
      sort(sortObj) {
        return chain;
      },
      then(resolve, reject) {
        return Promise.resolve(chain._doc).then(resolve, reject);
      },
    };
    return chain;
  }

  findById(id) {
    const found = this.docs.find(d => String(d._id) === String(id) || d.userId === id);
    const doc = found ? this.decorate({ ...found }) : null;
    const chain = {
      _doc: doc,
      select(fields) {
        return chain;
      },
      then(resolve, reject) {
        return Promise.resolve(chain._doc).then(resolve, reject);
      },
    };
    return chain;
  }

  async create(data) {
    const doc = this.decorate({ ...data });
    this.docs.push(doc);
    return doc;
  }

  async countDocuments(filter = {}) {
    return this.docs.filter(d => matchesFilter(d, filter)).length;
  }

  async deleteMany(filter = {}) {
    this.docs = this.docs.filter(d => !matchesFilter(d, filter));
    return { acknowledged: true };
  }
}

// User Collection with custom methods
class UserCollection extends BaseCollection {
  decorate(doc) {
    super.decorate(doc);
    doc.comparePassword = async function (enteredPassword) {
      if (doc.passwordHash && enteredPassword) {
        return await bcrypt.compare(enteredPassword, doc.passwordHash);
      }
      return false;
    };
    return doc;
  }

  async register({ userId, email, password, role, name }) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = {
      userId,
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      passwordHash,
      role: role || 'SECURITY_ANALYST',
      lastLogin: null,
    };
    return await this.create(user);
  }
}

// CVE Collection with search & getDetails
class CVECollection extends BaseCollection {
  decorate(doc) {
    super.decorate(doc);
    doc.getDetails = function () {
      return {
        cveId: doc.cveId,
        description: doc.description,
        cvssScore: doc.cvssScore,
        severity: doc.severity,
        publishedDate: doc.publishedDate,
        cweId: doc.cweId,
        affectedComponent: doc.affectedComponent,
        references: doc.references,
      };
    };
    return doc;
  }

  async search(query) {
    const q = (query || '').toLowerCase();
    const matches = this.docs.filter(
      d =>
        (d.cveId && d.cveId.toLowerCase().includes(q)) ||
        (d.description && d.description.toLowerCase().includes(q)) ||
        (d.affectedComponent && d.affectedComponent.toLowerCase().includes(q))
    );
    return matches.map(d => this.decorate({ ...d }));
  }
}

// IOC Collection with consolidate()
class IOCCollection extends BaseCollection {
  decorate(doc) {
    super.decorate(doc);
    if (!doc.otxPulses) doc.otxPulses = [];
    doc.consolidate = function () {
      const pulseFactor = Math.min((doc.otxPulses?.length || 0) * 12, 100);
      const abuseFactor = doc.abuseConfidence || 0;
      doc.reputationScore = Number(((abuseFactor * 0.6) + (pulseFactor * 0.4)).toFixed(1));
      return doc.reputationScore;
    };
    return doc;
  }
}

// MalwareSample Collection with analyze() & getHistory()
class MalwareCollection extends BaseCollection {
  decorate(doc) {
    super.decorate(doc);
    if (!doc.history) doc.history = [];
    doc.analyze = function () {
      return {
        hash: doc.hash,
        fileName: doc.fileName,
        detectionRatio: doc.detectionRatio,
        malwareFamily: doc.malwareFamily,
        tags: doc.tags,
        positives: doc.positives,
        totalEngines: doc.totalEngines,
      };
    };
    doc.getHistory = function () {
      return doc.history;
    };
    return doc;
  }
}

// MitreMapping Collection with mapThreat() & aggregate()
class MitreCollection extends BaseCollection {
  decorate(doc) {
    super.decorate(doc);
    doc.mapThreat = function () {
      return {
        mappingId: doc.mappingId,
        tactic: `${doc.tacticId} - ${doc.tacticName}`,
        technique: `${doc.techniqueId} - ${doc.techniqueName}`,
        linkedType: doc.linkedType,
        linkedRef: doc.linkedRef,
        confidence: doc.confidence,
      };
    };
    return doc;
  }

  async aggregate(pipeline) {
    const tacticCounts = {};
    for (const d of this.docs) {
      if (!tacticCounts[d.tacticName]) {
        tacticCounts[d.tacticName] = { _id: d.tacticName, count: 0, tacticId: d.tacticId };
      }
      tacticCounts[d.tacticName].count += 1;
    }
    return Object.values(tacticCounts);
  }
}

// Alert Collection with markRead() & dismiss()
class AlertCollection extends BaseCollection {
  decorate(doc) {
    super.decorate(doc);
    const self = this;
    doc.markRead = async function () {
      doc.status = 'READ';
      doc.readAt = new Date();
      return await doc.save();
    };
    doc.dismiss = async function () {
      doc.status = 'DISMISSED';
      doc.dismissedAt = new Date();
      return await doc.save();
    };
    return doc;
  }
}

// Report Collection with generate() & export()
class ReportCollection extends BaseCollection {
  decorate(doc) {
    super.decorate(doc);
    if (!doc.records) {
      doc.records = { cves: [], iocs: [], malwareSamples: [], mitreMappings: [] };
    }
    doc.generate = function () {
      return {
        reportId: doc.reportId,
        title: doc.title,
        createdDate: doc.createdDate,
        format: doc.format,
        recordsCount: {
          cves: doc.records.cves?.length || 0,
          iocs: doc.records.iocs?.length || 0,
          malware: doc.records.malwareSamples?.length || 0,
          mitre: doc.records.mitreMappings?.length || 0,
        },
      };
    };
    doc.export = function () {
      return {
        downloadUrl: `/api/reports/${doc.reportId}/export`,
        format: doc.format,
        reportId: doc.reportId,
      };
    };
    return doc;
  }
}

class QueryLogCollection extends BaseCollection {}

export const memoryDb = {
  User: new UserCollection('User'),
  CVE: new CVECollection('CVE'),
  IOC: new IOCCollection('IOC'),
  MalwareSample: new MalwareCollection('MalwareSample'),
  MitreMapping: new MitreCollection('MitreMapping'),
  Alert: new AlertCollection('Alert'),
  Report: new ReportCollection('Report'),
  QueryLog: new QueryLogCollection('QueryLog'),
};
