import User from '../models/User.js';
import CVE from '../models/CVE.js';
import IOC from '../models/IOC.js';
import MalwareSample from '../models/MalwareSample.js';
import MitreMapping from '../models/MitreMapping.js';
import Alert from '../models/Alert.js';
import Report from '../models/Report.js';

export const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('[Seed] Database already seeded. Skipping initial seeding.');
      return;
    }

    console.log('[Seed] Seeding baseline instances from UML Object Diagram (Slide 18)...');

    // 1. Pre-seed Users (Password: Password@123)
    const analyst1 = await User.register({
      userId: 'USR-001',
      email: 'a.rao@soc.org',
      password: 'Password@123',
      role: 'SECURITY_ANALYST',
      name: 'A. Rao (Security Analyst)',
    });

    const socLead = await User.register({
      userId: 'USR-002',
      email: 'soc.lead@soc.org',
      password: 'Password@123',
      role: 'SOC_TEAM',
      name: 'SOC Operations Lead',
    });

    const researcher = await User.register({
      userId: 'USR-003',
      email: 'researcher@soc.org',
      password: 'Password@123',
      role: 'TI_RESEARCHER',
      name: 'TI Researcher (Intelligence Unit)',
    });

    // 2. Pre-seed CVE (cve1: CVE-2024-3094)
    const cve1 = await CVE.create({
      cveId: 'CVE-2024-3094',
      description: 'Malicious code backdoor discovered in upstream tarballs of XZ Embedded and XZ Utils starting with version 5.6.0. Injects code into liblzma facilitating unauthorized SSH daemon authentication bypass (Remote Code Execution).',
      cvssScore: 10.0,
      severity: 'CRITICAL',
      publishedDate: new Date('2024-03-29'),
      cweId: 'CWE-506: Embedded Malicious Code',
      affectedComponent: 'XZ Utils / liblzma versions 5.6.0 & 5.6.1',
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2024-3094',
        'https://www.cisa.gov/news-events/alerts/2024/03/29/reported-supply-chain-compromise-affecting-xz-utils-data-compression-library',
      ],
    });

    const cve2 = await CVE.create({
      cveId: 'CVE-2023-44487',
      description: 'The HTTP/2 protocol allows a denial of service (server resource consumption) because request cancellation can reset many streams quickly (HTTP/2 Rapid Reset attack).',
      cvssScore: 7.5,
      severity: 'HIGH',
      publishedDate: new Date('2023-10-10'),
      cweId: 'CWE-400: Uncontrolled Resource Consumption',
      affectedComponent: 'HTTP/2 protocol implementations (RFC 7540)',
      references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-44487'],
    });

    const cve3 = await CVE.create({
      cveId: 'CVE-2024-6387',
      description: 'A signal handler race condition in OpenSSH server (sshd) on glibc-based Linux systems allows unauthenticated remote code execution as root (dubbed regreSSHion).',
      cvssScore: 8.1,
      severity: 'HIGH',
      publishedDate: new Date('2024-07-01'),
      cweId: 'CWE-362: Concurrent Execution',
      affectedComponent: 'OpenSSH sshd 8.5p1 through 9.7p1',
      references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-6387'],
    });

    const cve4 = await CVE.create({
      cveId: 'CVE-2024-21626',
      description: 'runc process working directory file descriptor leak allowing container breakout through /proc/self/fd/7 and full host filesystem root takeover.',
      cvssScore: 8.6,
      severity: 'HIGH',
      publishedDate: new Date('2024-01-31'),
      cweId: 'CWE-403: Exposure of File Descriptor',
      affectedComponent: 'runc <= 1.1.11, Docker, Kubernetes container runtime',
      references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-21626'],
    });

    // 3. Pre-seed IOC (ioc1: 185.220.101.4)
    const ioc1 = await IOC.create({
      value: '185.220.101.4',
      type: 'IP',
      abuseConfidence: 97,
      reputationScore: 95.0,
      otxPulses: [
        {
          id: 'pulse-otx-2024-009',
          name: 'Active Tor Exit Node Relaying Cobalt Strike Team Server Traffic',
          author: 'AlienVault Labs',
          created: new Date('2024-02-14'),
          tags: ['tor-exit', 'cobalt-strike', 'c2-proxy', 'apt29'],
          adversary: 'APT29 (Cozy Bear)',
        },
        {
          id: 'pulse-otx-2024-032',
          name: 'High-Volume Brute Force & SSH Credential Stuffing Campaign',
          author: 'EmergingThreats SOC',
          created: new Date('2024-04-10'),
          tags: ['ssh-bruteforce', 'scanning', 'botnet'],
          adversary: 'Mirai Variant / DarkNexus',
        },
      ],
      geolocation: {
        country: 'Germany',
        countryCode: 'DE',
        city: 'Jena',
        isp: 'Zwiebelfreunde e.V. (Tor Node)',
      },
      queriedBy: analyst1._id,
    });

    const ioc2 = await IOC.create({
      value: 'dark-update.biz',
      type: 'DOMAIN',
      abuseConfidence: 89,
      reputationScore: 88.0,
      otxPulses: [
        {
          id: 'pulse-otx-2024-081',
          name: 'Phishing & Fake Browser Update Delivery Domain',
          author: 'ThreatConnect',
          created: new Date('2024-05-18'),
          tags: ['phishing', 'fake-update', 'socgholish'],
          adversary: 'TA569',
        },
      ],
      geolocation: {
        country: 'Netherlands',
        countryCode: 'NL',
        city: 'Amsterdam',
        isp: 'FastFlux Hosting Ltd.',
      },
      queriedBy: analyst1._id,
    });

    // 4. Pre-seed MalwareSample (mal1: 44d88612fea8a8f36de82e1278abb02f)
    const mal1 = await MalwareSample.create({
      hash: '44d88612fea8a8f36de82e1278abb02f',
      fileName: 'payload_dropper.exe',
      detectionRatio: 0.82,
      malwareFamily: 'Trojan.Dropper.Agent',
      tags: ['dropper', 'evasion', 'stealth-injector', 'backdoor'],
      fileType: 'PE32 Executable (GUI) Intel 80386',
      fileSizeBytes: 489216,
      positives: 58,
      totalEngines: 70,
      engineResults: [
        { engine: 'Microsoft Defender', category: 'malicious', result: 'Trojan:Win32/Woreflint.A!cl' },
        { engine: 'Kaspersky', category: 'malicious', result: 'HEUR:Trojan-Dropper.Win32.Agent.gen' },
        { engine: 'CrowdStrike Falcon', category: 'malicious', result: 'Win/malicious_confidence_98% (D)' },
        { engine: 'Sophos', category: 'malicious', result: 'Mal/Generic-S' },
        { engine: 'Symantec', category: 'malicious', result: 'Trojan.Gen.NPE' },
      ],
      history: [
        {
          scannedAt: new Date('2024-05-12'),
          detectionRatio: 0.82,
          notes: 'Triage sample uploaded from compromised perimeter endpoint.',
        },
      ],
    });

    // 5. Pre-seed MitreMapping (m1: TA0001 / T1190)
    const m1 = await MitreMapping.create({
      mappingId: 'MAP-001',
      tacticId: 'TA0001',
      tacticName: 'Initial Access',
      techniqueId: 'T1190',
      techniqueName: 'Exploit Public-Facing Application',
      linkedType: 'CVE',
      linkedRef: 'CVE-2024-3094',
      evidence: 'Backdoored liblzma exposed to sshd allows pre-auth payload delivery across internet-facing ports.',
      confidence: 'HIGH',
    });

    const m2 = await MitreMapping.create({
      mappingId: 'MAP-002',
      tacticId: 'TA0002',
      tacticName: 'Execution',
      techniqueId: 'T1059',
      techniqueName: 'Command and Scripting Interpreter',
      linkedType: 'MALWARE',
      linkedRef: '44d88612fea8a8f36de82e1278abb02f',
      evidence: 'payload_dropper.exe invokes cmd.exe and powershell to unpack obfuscated stages.',
      confidence: 'HIGH',
    });

    const m3 = await MitreMapping.create({
      mappingId: 'MAP-003',
      tacticId: 'TA0011',
      tacticName: 'Command and Control',
      techniqueId: 'T1071',
      techniqueName: 'Application Layer Protocol',
      linkedType: 'IOC',
      linkedRef: '185.220.101.4',
      evidence: 'Tor exit relay used for egress C2 beaconing over TLS port 443.',
      confidence: 'HIGH',
    });

    // 6. Pre-seed Alert (alert1: HIGH, UNREAD, triggered by mal1)
    const alert1 = await Alert.create({
      alertId: 'ALT-001',
      title: 'Malicious Binary Execution Triggered (payload_dropper.exe)',
      description: 'Host endpoint executed binary matching hash 44d88612fea8a8f36de82e1278abb02f with 82% VirusTotal detection ratio.',
      severity: 'HIGH',
      status: 'UNREAD',
      sourceType: 'MALWARE',
      sourceRef: '44d88612fea8a8f36de82e1278abb02f',
      mitreTactic: 'TA0002 - Execution',
      mitreTechnique: 'T1059 - Command and Scripting Interpreter',
    });

    const alert2 = await Alert.create({
      alertId: 'ALT-002',
      title: 'Critical CVE-2024-3094 (XZ Utils) Detected on Perimeter Gateway',
      description: 'CVSS 10.0 vulnerability detected in active upstream package liblzma. Immediate isolation required.',
      severity: 'CRITICAL',
      status: 'UNREAD',
      sourceType: 'CVE',
      sourceRef: 'CVE-2024-3094',
      mitreTactic: 'TA0001 - Initial Access',
      mitreTechnique: 'T1190 - Exploit Public-Facing Application',
    });

    const alert3 = await Alert.create({
      alertId: 'ALT-003',
      title: 'Suspicious Inbound Tor Relay Traffic: 185.220.101.4',
      description: 'Abuse confidence score is 97%. 1,842 community abuse reports recorded in AbuseIPDB.',
      severity: 'HIGH',
      status: 'UNREAD',
      sourceType: 'IOC',
      sourceRef: '185.220.101.4',
      mitreTactic: 'TA0011 - Command and Control',
      mitreTechnique: 'T1071 - Application Layer Protocol',
    });

    // 7. Pre-seed Report (report1: R-0007 containing m1, cve1, and ioc1)
    const report1 = await Report.create({
      reportId: 'R-0007',
      title: 'XZ Utils Backdoor & Active Tor C2 Infrastructure Threat Briefing',
      createdDate: new Date('2024-06-15'),
      format: 'PDF',
      executiveSummary: 'This consolidated threat briefing examines the supply chain compromise in XZ Utils (CVE-2024-3094), correlating observed inbound command-and-control beaconing from known Tor exit relay 185.220.101.4 and dropper telemetry. SOC action items include immediate dependency rollback and perimeter IP blocking.',
      records: {
        cves: [
          {
            cveId: cve1.cveId,
            description: cve1.description,
            cvssScore: cve1.cvssScore,
            severity: cve1.severity,
          },
        ],
        iocs: [
          {
            value: ioc1.value,
            type: ioc1.type,
            reputationScore: ioc1.reputationScore,
            abuseConfidence: ioc1.abuseConfidence,
          },
        ],
        malwareSamples: [
          {
            hash: mal1.hash,
            fileName: mal1.fileName,
            detectionRatio: mal1.detectionRatio,
            malwareFamily: mal1.malwareFamily,
          },
        ],
        mitreMappings: [
          {
            tacticId: m1.tacticId,
            tacticName: m1.tacticName,
            techniqueId: m1.techniqueId,
            techniqueName: m1.techniqueName,
            linkedRef: m1.linkedRef,
          },
        ],
      },
      generatedBy: researcher._id,
      authorName: 'TI Researcher (Intelligence Unit)',
    });

    console.log('[Seed] Seeding completed successfully. Baseline Object Diagram instances created:');
    console.log(' - User (analyst1): a.rao@soc.org (Password@123)');
    console.log(' - CVE (cve1): CVE-2024-3094 (CVSS: 10.0, CRITICAL)');
    console.log(' - IOC (ioc1): 185.220.101.4 (abuseConfidence: 97)');
    console.log(' - MalwareSample (mal1): 44d88612... (detectionRatio: 0.82)');
    console.log(' - MitreMapping (m1): TA0001 / T1190');
    console.log(' - Alert (alert1): ALT-001 (HIGH, UNREAD)');
    console.log(' - Report (report1): R-0007 (PDF)');
  } catch (err) {
    console.error(`[Seed] Error during seeding: ${err.message}`);
  }
};
