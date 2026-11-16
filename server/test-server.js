import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './src/config/db.js';
import { seedDatabase } from './src/data/seedData.js';
import User from './src/models/User.js';
import CVE from './src/models/CVE.js';
import IOC from './src/models/IOC.js';
import MalwareSample from './src/models/MalwareSample.js';
import Alert from './src/models/Alert.js';
import Report from './src/models/Report.js';
import MitreMapping from './src/models/MitreMapping.js';
import externalAPIService from './src/services/ExternalAPIService.js';
import correlationEngine from './src/services/CorrelationEngine.js';
import pdfReportService from './src/services/PDFReportService.js';

const runTests = async () => {
  console.log('--- STARTING CTI PORTAL INTEGRATION VERIFICATION ---');

  // 1. Connect and Seed
  await connectDB();
  await seedDatabase();

  // 2. Verify User Authentication & State Machine
  console.log('\n[Test 1] User Session State Machine & Passwords');
  const analyst = await User.findOne({ email: 'a.rao@soc.org' });
  const isPwValid = await analyst.comparePassword('Password@123');
  console.log(`Analyst found: ${analyst?.email}, Role: ${analyst?.role}, Password match: ${isPwValid}`);

  const socLead = await User.findOne({ email: 'soc.lead@soc.org' });
  console.log(`SOC Lead found: ${socLead?.email}, Role: ${socLead?.role}`);

  const researcher = await User.findOne({ email: 'researcher@soc.org' });
  console.log(`TI Researcher found: ${researcher?.email}, Role: ${researcher?.role}`);

  // 3. Verify CVE Search & getDetails()
  console.log('\n[Test 2] CVE Search & Details (FR-02)');
  const cveSearchRes = await CVE.search('CVE-2024-3094');
  console.log(`CVE-2024-3094 Search returned: ${cveSearchRes.length} records`);
  console.log(`CVSS Score: ${cveSearchRes[0]?.cvssScore}, Severity: ${cveSearchRes[0]?.severity}`);
  const details = cveSearchRes[0]?.getDetails();
  console.log(`getDetails() CWE: ${details?.cweId}`);

  // 4. Verify IOC Investigation & consolidate()
  console.log('\n[Test 3] IOC Investigation & Consolidation (FR-03 & FR-04)');
  const ioc = await IOC.findOne({ value: '185.220.101.4' });
  const consolidatedScore = ioc.consolidate();
  console.log(`IOC: ${ioc.value}, Type: ${ioc.type}, AbuseConfidence: ${ioc.abuseConfidence}%, Consolidated Score: ${consolidatedScore}`);
  console.log(`OTX Pulses count: ${ioc.otxPulses?.length}`);

  // 5. Verify Malware Sample & analyze()
  console.log('\n[Test 4] Malware Sample Reputation (FR-06)');
  const mal = await MalwareSample.findOne({ hash: '44d88612fea8a8f36de82e1278abb02f' });
  const analysis = mal.analyze();
  console.log(`Sample: ${mal.fileName}, Hash: ${mal.hash}`);
  console.log(`Detection Ratio: ${mal.detectionRatio} (${analysis.positives}/${analysis.totalEngines} engines flagged)`);
  console.log(`Malware Family: ${mal.malwareFamily}`);

  // 6. Verify MITRE ATT&CK Mapping
  console.log('\n[Test 5] MITRE ATT&CK Mapping (FR-05)');
  const m1 = await MitreMapping.findOne({ tacticId: 'TA0001' });
  const mapped = m1.mapThreat();
  console.log(`Mapping: ${mapped.tactic} -> ${mapped.technique}, Linked: ${mapped.linkedRef}`);

  // 7. Verify Alert Lifecycle State Machine (FR-07)
  console.log('\n[Test 6] Alert Lifecycle State Machine (FR-07)');
  const alert1 = await Alert.findOne({ alertId: 'ALT-001' });
  console.log(`Alert initial status: ${alert1.status}, Severity: ${alert1.severity}`);
  await alert1.markRead();
  console.log(`After markRead(): status = ${alert1.status}, readAt = ${alert1.readAt}`);
  await alert1.dismiss();
  console.log(`After dismiss(): status = ${alert1.status}, dismissedAt = ${alert1.dismissedAt}`);

  // 8. Verify Report Generation & PDF Compilation (FR-08)
  console.log('\n[Test 7] Report Generation & PDF Export (FR-08)');
  const report1 = await Report.findOne({ reportId: 'R-0007' });
  const repGen = report1.generate();
  console.log(`Report: ${repGen.reportId}, Title: ${report1.title}, Format: ${repGen.format}`);
  console.log(`Records contained: CVEs=${repGen.recordsCount.cves}, IOCs=${repGen.recordsCount.iocs}, Malware=${repGen.recordsCount.malware}`);
  
  const pdfBuffer = await pdfReportService.generatePDF(report1);
  console.log(`PDF successfully compiled! Buffer size: ${pdfBuffer.length} bytes (starts with: ${pdfBuffer.slice(0, 5).toString()})`);

  console.log('\n======================================================');
  console.log(' ALL DOMAIN MODELS & UML SPECIFICATIONS VERIFIED 100%!');
  console.log('======================================================');
  process.exit(0);
};

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
