import CVE from '../models/CVE.js';
import QueryLog from '../models/QueryLog.js';
import externalAPIService from '../services/ExternalAPIService.js';
import correlationEngine from '../services/CorrelationEngine.js';

export const searchCVE = async (req, res) => {
  const startTime = Date.now();
  try {
    const query = req.query.query || '';
    if (!query.trim()) {
      // Return recently cached CVEs if empty query
      const recent = await CVE.find().sort({ cvssScore: -1 }).limit(10);
      return res.status(200).json({
        success: true,
        count: recent.length,
        results: recent,
        source: 'MONGODB_CACHE',
      });
    }

    // Check MongoDB cache first
    let cached = await CVE.search(query);
    if (cached && cached.length > 0) {
      await QueryLog.create({
        endpoint: '/api/cve/search',
        queryType: 'CVE',
        queryParam: query,
        status: 'SUCCESS',
        source: 'MONGODB_CACHE',
        responseTimeMs: Date.now() - startTime,
        userEmail: req.user?.email || 'anonymous',
      });

      return res.status(200).json({
        success: true,
        count: cached.length,
        results: cached,
        source: 'MONGODB_CACHE',
      });
    }

    // Query External NVD API / threat intelligence adapter
    const liveResults = await externalAPIService.fetchNVD(query);

    // Save/cache new findings in MongoDB and run correlation
    const savedResults = [];
    for (const item of liveResults) {
      let doc = await CVE.findOne({ cveId: item.cveId });
      if (!doc) {
        doc = await CVE.create({
          cveId: item.cveId,
          description: item.description,
          cvssScore: item.cvssScore,
          severity: item.severity,
          publishedDate: item.publishedDate,
          cweId: item.cweId,
          affectedComponent: item.affectedComponent,
          references: item.references,
        });
      }
      // Run correlation engine (auto-alert if critical)
      await correlationEngine.correlateCVE(doc);
      savedResults.push(doc);
    }

    await QueryLog.create({
      endpoint: '/api/cve/search',
      queryType: 'CVE',
      queryParam: query,
      status: 'SUCCESS',
      source: 'EXTERNAL_NVD_SERVICE',
      responseTimeMs: Date.now() - startTime,
      userEmail: req.user?.email || 'anonymous',
    });

    res.status(200).json({
      success: true,
      count: savedResults.length,
      results: savedResults,
      source: 'EXTERNAL_NVD_SERVICE',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getCVEDetails = async (req, res) => {
  try {
    const { cveId } = req.params;
    let cve = await CVE.findOne({ cveId: cveId.toUpperCase() });
    
    if (!cve) {
      // Attempt fetching from external API
      const live = await externalAPIService.fetchNVD(cveId);
      if (live && live.length > 0) {
        cve = await CVE.create(live[0]);
      }
    }

    if (!cve) {
      return res.status(404).json({ success: false, error: `CVE ${cveId} not found.` });
    }

    res.status(200).json({
      success: true,
      data: cve.getDetails(),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const triggerCVEAlert = async (req, res) => {
  try {
    const { cveId } = req.params;
    const cve = await CVE.findOne({ cveId });
    if (!cve) {
      return res.status(404).json({ success: false, error: 'CVE record not found' });
    }

    const alert = await correlationEngine.correlateCVE(cve);
    res.status(200).json({
      success: true,
      message: alert ? 'SOC Alert generated for CVE' : 'Alert already existed or not critical',
      alert,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
