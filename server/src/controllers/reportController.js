import Report from '../models/Report.js';
import CVE from '../models/CVE.js';
import IOC from '../models/IOC.js';
import MalwareSample from '../models/MalwareSample.js';
import MitreMapping from '../models/MitreMapping.js';
import pdfReportService from '../services/PDFReportService.js';

export const generateReport = async (req, res) => {
  try {
    const { title, executiveSummary, selectedCveIds = [], selectedIocValues = [], selectedMalwareHashes = [] } = req.body;

    // RBAC validation: only TI_RESEARCHER is authorized to generate reports according to UML Use Case & Activity diagrams
    if (req.user?.role !== 'TI_RESEARCHER') {
      return res.status(403).json({
        success: false,
        error: `Access Denied: Only Threat Intelligence Researchers ('TI_RESEARCHER') can generate threat reports. Current role: '${req.user?.role}'.`,
      });
    }

    // Validation: at least one record must be selected
    const totalSelected = selectedCveIds.length + selectedIocValues.length + selectedMalwareHashes.length;
    if (totalSelected === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error: Please select at least one CVE, IOC, or Malware sample to compile into the report.',
      });
    }

    // Aggregate threat data
    const cves = await CVE.find({ cveId: { $in: selectedCveIds } });
    const iocs = await IOC.find({ value: { $in: selectedIocValues } });
    const malwareSamples = await MalwareSample.find({ hash: { $in: selectedMalwareHashes } });

    // Correlate linked MITRE mappings
    const linkedEntities = [
      ...cves.map((c) => c.cveId),
      ...iocs.map((i) => i.value),
      ...malwareSamples.map((m) => m.hash),
    ];
    const mitreMappings = await MitreMapping.find({
      linkedRef: { $in: linkedEntities },
    });

    const reportCount = await Report.countDocuments();
    const reportId = `R-${String(reportCount + 1).padStart(4, '0')}`;

    const report = new Report({
      reportId,
      title: title || `Consolidated Threat Briefing (${reportId})`,
      createdDate: new Date(),
      format: 'PDF',
      executiveSummary: executiveSummary || `Consolidated threat assessment compiling ${cves.length} vulnerabilities, ${iocs.length} indicators, and ${malwareSamples.length} malware samples. Prepared for incident response teams.`,
      records: {
        cves: cves.map((c) => ({
          cveId: c.cveId,
          description: c.description,
          cvssScore: c.cvssScore,
          severity: c.severity,
        })),
        iocs: iocs.map((i) => ({
          value: i.value,
          type: i.type,
          reputationScore: i.reputationScore,
          abuseConfidence: i.abuseConfidence,
        })),
        malwareSamples: malwareSamples.map((m) => ({
          hash: m.hash,
          fileName: m.fileName,
          detectionRatio: m.detectionRatio,
          malwareFamily: m.malwareFamily,
        })),
        mitreMappings: mitreMappings.map((m) => ({
          tacticId: m.tacticId,
          tacticName: m.tacticName,
          techniqueId: m.techniqueId,
          techniqueName: m.techniqueName,
          linkedRef: m.linkedRef,
        })),
      },
      generatedBy: req.user?._id || null,
      authorName: req.user?.name || req.user?.email || 'B.Tech CSE TI Researcher',
    });

    await report.save();
    console.log(`[Report] Generated report ${reportId} with ${totalSelected} records.`);

    res.status(201).json({
      success: true,
      message: `Report ${reportId} generated successfully. Ready for download.`,
      report: report.generate(),
      exportData: report.export(),
      reportDoc: report,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const exportReportPDF = async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await Report.findOne({ reportId });
    if (!report) {
      return res.status(404).json({ success: false, error: `Report ${reportId} not found.` });
    }

    const pdfBuffer = await pdfReportService.generatePDF(report);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${report.reportId}_Threat_Report.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const listReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdDate: -1 });
    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getReportDetails = async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await Report.findOne({ reportId });
    if (!report) {
      return res.status(404).json({ success: false, error: `Report ${reportId} not found.` });
    }
    res.status(200).json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
