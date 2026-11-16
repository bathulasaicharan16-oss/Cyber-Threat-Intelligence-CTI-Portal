import CVE from '../models/CVE.js';
import IOC from '../models/IOC.js';
import MalwareSample from '../models/MalwareSample.js';
import MitreMapping from '../models/MitreMapping.js';
import Alert from '../models/Alert.js';
import Report from '../models/Report.js';

export const loadWidgets = async (req, res) => {
  try {
    // Aggregated metrics
    const [
      cveCount,
      criticalCveCount,
      iocCount,
      highRiskIocCount,
      malwareCount,
      alertCount,
      unreadAlertCount,
      reportCount,
    ] = await Promise.all([
      CVE.countDocuments(),
      CVE.countDocuments({ severity: 'CRITICAL' }),
      IOC.countDocuments(),
      IOC.countDocuments({ abuseConfidence: { $gte: 80 } }),
      MalwareSample.countDocuments(),
      Alert.countDocuments(),
      Alert.countDocuments({ status: 'UNREAD' }),
      Report.countDocuments(),
    ]);

    // Severity breakdown for pie/donut charts
    const [cveCritical, cveHigh, cveMedium, cveLow] = await Promise.all([
      CVE.countDocuments({ severity: 'CRITICAL' }),
      CVE.countDocuments({ severity: 'HIGH' }),
      CVE.countDocuments({ severity: 'MEDIUM' }),
      CVE.countDocuments({ severity: 'LOW' }),
    ]);

    const severityBreakdown = [
      { name: 'Critical', value: cveCritical, color: '#ef4444' },
      { name: 'High', value: cveHigh, color: '#f97316' },
      { name: 'Medium', value: cveMedium, color: '#eab308' },
      { name: 'Low', value: cveLow, color: '#10b981' },
    ];

    // MITRE Tactic distribution for bar chart
    const tacticAggregation = await MitreMapping.aggregate([
      { $group: { _id: '$tacticName', count: { $sum: 1 }, tacticId: { $first: '$tacticId' } } },
      { $sort: { count: -1 } },
    ]);

    const tacticDistribution = tacticAggregation.map((t) => ({
      tactic: t._id,
      tacticId: t.tacticId,
      count: t.count,
    }));

    // Recent Threat Alerts
    const recentAlerts = await Alert.find()
      .sort({ createdAt: -1 })
      .limit(6);

    // Recent IOCs
    const recentIOCs = await IOC.find()
      .sort({ updatedAt: -1 })
      .limit(5);

    // Recent CVEs
    const recentCVEs = await CVE.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        kpi: {
          totalCVEs: cveCount,
          criticalCVEs: criticalCveCount,
          totalIOCs: iocCount,
          highRiskIOCs: highRiskIocCount,
          totalMalware: malwareCount,
          totalAlerts: alertCount,
          unreadAlerts: unreadAlertCount,
          totalReports: reportCount,
        },
        severityBreakdown,
        tacticDistribution: tacticDistribution.length > 0 ? tacticDistribution : [
          { tactic: 'Initial Access', tacticId: 'TA0001', count: 4 },
          { tactic: 'Execution', tacticId: 'TA0002', count: 3 },
          { tactic: 'Command & Control', tacticId: 'TA0011', count: 3 },
          { tactic: 'Defense Evasion', tacticId: 'TA0005', count: 2 },
          { tactic: 'Persistence', tacticId: 'TA0003', count: 1 },
        ],
        recentAlerts,
        recentIOCs,
        recentCVEs,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
