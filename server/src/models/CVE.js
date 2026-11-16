import mongoose from 'mongoose';
import { getModel } from '../config/db.js';

const cveSchema = new mongoose.Schema(
  {
    cveId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    cvssScore: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    severity: {
      type: String,
      enum: ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
    },
    publishedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    cweId: {
      type: String,
      default: 'NVD-CWE-noinfo',
    },
    affectedComponent: {
      type: String,
      default: '',
    },
    references: [{
      type: String,
    }],
    cachedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

cveSchema.statics.search = async function (query) {
  const regex = new RegExp(query, 'i');
  return await this.find({
    $or: [{ cveId: regex }, { description: regex }, { affectedComponent: regex }],
  }).sort({ cvssScore: -1 });
};

cveSchema.methods.getDetails = function () {
  return {
    cveId: this.cveId,
    description: this.description,
    cvssScore: this.cvssScore,
    severity: this.severity,
    publishedDate: this.publishedDate,
    cweId: this.cweId,
    affectedComponent: this.affectedComponent,
    references: this.references,
  };
};

const MongooseCVE = mongoose.model('CVE', cveSchema);
const CVE = getModel('CVE', MongooseCVE);
export default CVE;
