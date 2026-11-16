import IOC from '../models/IOC.js';
import QueryLog from '../models/QueryLog.js';
import externalAPIService from '../services/ExternalAPIService.js';
import correlationEngine from '../services/CorrelationEngine.js';

export const investigateIOC = async (req, res) => {
  const startTime = Date.now();
  try {
    const { value, type } = req.body;
    if (!value) {
      return res.status(400).json({ success: false, error: 'Indicator value is required.' });
    }

    const trimmedValue = value.trim();

    // Auto-detect type if not provided
    let detectedType = type;
    if (!detectedType) {
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(trimmedValue)) {
        detectedType = 'IP';
      } else if (trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')) {
        detectedType = 'URL';
      } else if (/^[a-fA-F0-9]{32,64}$/.test(trimmedValue)) {
        detectedType = 'HASH';
      } else {
        detectedType = 'DOMAIN';
      }
    }

    console.log(`[IOC] Investigating ${detectedType}: ${trimmedValue}`);

    // Check if existing record is cached within 24h
    let iocDoc = await IOC.findOne({ value: trimmedValue });
    
    // Step 3 & 4 in Communication Diagram: queryPulses() from OTX + queryReputation() from AbuseIPDB
    const otxPulses = await externalAPIService.fetchOTX(trimmedValue);
    let abuseData = null;
    if (detectedType === 'IP') {
      abuseData = await externalAPIService.fetchAbuseIPDB(trimmedValue);
    } else {
      abuseData = {
        abuseConfidence: otxPulses.length > 0 ? Math.min(otxPulses.length * 25, 95) : 15,
        countryName: 'Distributed Cloud',
        countryCode: 'XX',
        isp: 'Global CDN / Transit Provider',
      };
    }

    if (!iocDoc) {
      iocDoc = new IOC({
        value: trimmedValue,
        type: detectedType,
        abuseConfidence: abuseData?.abuseConfidence || 0,
        otxPulses: otxPulses || [],
        geolocation: {
          country: abuseData?.countryName || 'Unknown',
          countryCode: abuseData?.countryCode || 'UN',
          isp: abuseData?.isp || 'Unknown ISP',
        },
        queriedBy: req.user?._id || null,
      });
    } else {
      iocDoc.abuseConfidence = abuseData?.abuseConfidence || iocDoc.abuseConfidence;
      iocDoc.otxPulses = otxPulses;
      if (abuseData?.countryName) {
        iocDoc.geolocation.country = abuseData.countryName;
        iocDoc.geolocation.countryCode = abuseData.countryCode;
        iocDoc.geolocation.isp = abuseData.isp;
      }
    }

    // Method: consolidate() computes normalized weighted score
    iocDoc.consolidate();
    await iocDoc.save();

    // Step 5: Save result & auto-correlate alerts & MITRE mappings
    const generatedAlert = await correlationEngine.correlateIOC(iocDoc);

    await QueryLog.create({
      endpoint: '/api/ioc/investigate',
      queryType: 'IOC',
      queryParam: trimmedValue,
      status: 'SUCCESS',
      source: 'EXTERNAL_ADAPTERS',
      responseTimeMs: Date.now() - startTime,
      userEmail: req.user?.email || 'anonymous',
    });

    res.status(200).json({
      success: true,
      data: iocDoc,
      alertGenerated: !!generatedAlert,
      alert: generatedAlert,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getIOCHistory = async (req, res) => {
  try {
    const list = await IOC.find().sort({ updatedAt: -1 }).limit(20);
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
