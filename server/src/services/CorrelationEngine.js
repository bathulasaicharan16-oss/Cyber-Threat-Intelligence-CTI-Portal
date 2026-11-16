import Alert from '../models/Alert.js';
import MitreMapping from '../models/MitreMapping.js';
import { v4 as uuidv4 } from 'uuid';

class CorrelationEngine {
  /**
   * Evaluate an investigated IOC and auto-trigger alert if abuseConfidence >= 80 or reputationScore >= 80
   */
  async correlateIOC(iocDoc) {
    const isCritical = iocDoc.abuseConfidence >= 80 || iocDoc.reputationScore >= 80;
    
    // Auto MITRE mapping for IOC
    let tactic = 'TA0011';
    let tacticName = 'Command and Control';
    let technique = 'T1071';
    let techniqueName = 'Application Layer Protocol';

    if (iocDoc.value.includes('185.220.101.4')) {
      tactic = 'TA0001';
      tacticName = 'Initial Access';
      technique = 'T1190';
      techniqueName = 'Exploit Public-Facing Application';
    }

    const existingMap = await MitreMapping.findOne({ linkedRef: iocDoc.value });
    if (!existingMap) {
      await MitreMapping.create({
        mappingId: `MAP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        tacticId: tactic,
        tacticName,
        techniqueId: technique,
        techniqueName,
        linkedType: 'IOC',
        linkedRef: iocDoc.value,
        evidence: `Automated correlation: High abuse score (${iocDoc.abuseConfidence}%) on ${iocDoc.type} ${iocDoc.value}`,
        confidence: 'HIGH',
      });
    }

    if (isCritical) {
      const existingAlert = await Alert.findOne({
        sourceRef: iocDoc.value,
        status: { $in: ['GENERATED', 'UNREAD'] },
      });

      if (!existingAlert) {
        const alertId = `ALT-${Date.now().toString().slice(-6)}`;
        return await Alert.create({
          alertId,
          title: `High-Risk IOC Detected: ${iocDoc.value} (${iocDoc.abuseConfidence}% Abuse Confidence)`,
          description: `Consolidated threat score reached ${iocDoc.reputationScore}/100. Observed in ${iocDoc.otxPulses?.length || 0} AlienVault threat pulses.`,
          severity: iocDoc.abuseConfidence >= 90 ? 'CRITICAL' : 'HIGH',
          status: 'UNREAD',
          sourceType: 'IOC',
          sourceRef: iocDoc.value,
          mitreTactic: `${tactic} - ${tacticName}`,
          mitreTechnique: `${technique} - ${techniqueName}`,
        });
      }
    }
    return null;
  }

  /**
   * Evaluate a CVE record and auto-trigger alert if CVSS score >= 9.0
   */
  async correlateCVE(cveDoc) {
    if (cveDoc.cvssScore >= 9.0 || cveDoc.severity === 'CRITICAL') {
      const existingAlert = await Alert.findOne({
        sourceRef: cveDoc.cveId,
        status: { $in: ['GENERATED', 'UNREAD'] },
      });

      // Auto MITRE mapping for Critical CVE
      const existingMap = await MitreMapping.findOne({ linkedRef: cveDoc.cveId });
      if (!existingMap) {
        await MitreMapping.create({
          mappingId: `MAP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          tacticId: 'TA0001',
          tacticName: 'Initial Access',
          techniqueId: 'T1190',
          techniqueName: 'Exploit Public-Facing Application',
          linkedType: 'CVE',
          linkedRef: cveDoc.cveId,
          evidence: `Critical CVSS vulnerability (${cveDoc.cvssScore}) in ${cveDoc.affectedComponent || 'target software'}`,
          confidence: 'HIGH',
        });
      }

      if (!existingAlert) {
        const alertId = `ALT-${Date.now().toString().slice(-6)}`;
        return await Alert.create({
          alertId,
          title: `Critical Vulnerability Disclosed: ${cveDoc.cveId} (CVSS ${cveDoc.cvssScore})`,
          description: cveDoc.description.slice(0, 180) + '...',
          severity: 'CRITICAL',
          status: 'UNREAD',
          sourceType: 'CVE',
          sourceRef: cveDoc.cveId,
          mitreTactic: 'TA0001 - Initial Access',
          mitreTechnique: 'T1190 - Exploit Public-Facing Application',
        });
      }
    }
    return null;
  }

  /**
   * Evaluate a Malware Sample and auto-trigger alert if detectionRatio >= 0.50
   */
  async correlateMalware(malDoc) {
    if (malDoc.detectionRatio >= 0.50) {
      // Auto MITRE mapping
      const existingMap = await MitreMapping.findOne({ linkedRef: malDoc.hash });
      if (!existingMap) {
        await MitreMapping.create({
          mappingId: `MAP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          tacticId: 'TA0002',
          tacticName: 'Execution',
          techniqueId: 'T1059',
          techniqueName: 'Command and Scripting Interpreter',
          linkedType: 'MALWARE',
          linkedRef: malDoc.hash,
          evidence: `High detection ratio (${(malDoc.detectionRatio * 100).toFixed(0)}%) for malware family ${malDoc.malwareFamily}`,
          confidence: 'HIGH',
        });
      }

      const existingAlert = await Alert.findOne({
        sourceRef: malDoc.hash,
        status: { $in: ['GENERATED', 'UNREAD'] },
      });

      if (!existingAlert) {
        const alertId = `ALT-${Date.now().toString().slice(-6)}`;
        return await Alert.create({
          alertId,
          title: `Malicious Binary Flagged: ${malDoc.fileName} (${(malDoc.detectionRatio * 100).toFixed(0)}% Detection)`,
          description: `Identified as ${malDoc.malwareFamily}. Flagged by ${malDoc.positives || Math.round(malDoc.detectionRatio * 70)} engines.`,
          severity: malDoc.detectionRatio >= 0.80 ? 'CRITICAL' : 'HIGH',
          status: 'UNREAD',
          sourceType: 'MALWARE',
          sourceRef: malDoc.hash,
          mitreTactic: 'TA0002 - Execution',
          mitreTechnique: 'T1059 - Command and Scripting Interpreter',
        });
      }
    }
    return null;
  }
}

export default new CorrelationEngine();
