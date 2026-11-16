import MitreMapping from '../models/MitreMapping.js';

// Pre-curated MITRE ATT&CK Enterprise Matrix framework definitions
const MITRE_FRAMEWORK = [
  {
    tacticId: 'TA0001',
    tacticName: 'Initial Access',
    description: 'Adversary is trying to get into your network.',
    techniques: [
      { techniqueId: 'T1190', techniqueName: 'Exploit Public-Facing Application' },
      { techniqueId: 'T1566', techniqueName: 'Phishing' },
      { techniqueId: 'T1078', techniqueName: 'Valid Accounts' },
      { techniqueId: 'T1195', techniqueName: 'Supply Chain Compromise' },
    ],
  },
  {
    tacticId: 'TA0002',
    tacticName: 'Execution',
    description: 'Adversary is trying to run malicious code.',
    techniques: [
      { techniqueId: 'T1059', techniqueName: 'Command and Scripting Interpreter' },
      { techniqueId: 'T1204', techniqueName: 'User Execution' },
      { techniqueId: 'T1053', techniqueName: 'Scheduled Task/Job' },
    ],
  },
  {
    tacticId: 'TA0003',
    tacticName: 'Persistence',
    description: 'Adversary is trying to maintain their foothold.',
    techniques: [
      { techniqueId: 'T1547', techniqueName: 'Boot or Logon Autostart Execution' },
      { techniqueId: 'T1136', techniqueName: 'Create Account' },
      { techniqueId: 'T1543', techniqueName: 'Create or Modify System Process' },
    ],
  },
  {
    tacticId: 'TA0004',
    tacticName: 'Privilege Escalation',
    description: 'Adversary is trying to gain higher-level permissions.',
    techniques: [
      { techniqueId: 'T1068', techniqueName: 'Exploitation for Privilege Escalation' },
      { techniqueId: 'T1055', techniqueName: 'Process Injection' },
    ],
  },
  {
    tacticId: 'TA0005',
    tacticName: 'Defense Evasion',
    description: 'Adversary is trying to avoid detection.',
    techniques: [
      { techniqueId: 'T1027', techniqueName: 'Obfuscated Files or Information' },
      { techniqueId: 'T1070', techniqueName: 'Indicator Removal' },
      { techniqueId: 'T1562', techniqueName: 'Impair Defenses' },
    ],
  },
  {
    tacticId: 'TA0011',
    tacticName: 'Command and Control',
    description: 'Adversary is trying to communicate with compromised systems.',
    techniques: [
      { techniqueId: 'T1071', techniqueName: 'Application Layer Protocol' },
      { techniqueId: 'T1090', techniqueName: 'Proxy' },
      { techniqueId: 'T1573', techniqueName: 'Encrypted Channel' },
    ],
  },
  {
    tacticId: 'TA0010',
    tacticName: 'Exfiltration',
    description: 'Adversary is trying to steal data.',
    techniques: [
      { techniqueId: 'T1041', techniqueName: 'Exfiltration Over C2 Channel' },
      { techniqueId: 'T1567', techniqueName: 'Exfiltration Over Web Service' },
    ],
  },
];

export const getMitreMatrix = async (req, res) => {
  try {
    const mappings = await MitreMapping.find().sort({ createdAt: -1 });

    // Augment framework tactics with active mapped instances
    const augmented = MITRE_FRAMEWORK.map((tactic) => {
      const activeMappings = mappings.filter((m) => m.tacticId === tactic.tacticId);
      return {
        ...tactic,
        activeMappingsCount: activeMappings.length,
        mappings: activeMappings,
      };
    });

    res.status(200).json({
      success: true,
      matrix: augmented,
      allMappings: mappings,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const mapThreat = async (req, res) => {
  try {
    const { tacticId, tacticName, techniqueId, techniqueName, linkedType, linkedRef, evidence } = req.body;
    if (!tacticId || !techniqueId || !linkedRef) {
      return res.status(400).json({ success: false, error: 'Tactic, technique, and linked reference are required.' });
    }

    const mappingId = `MAP-${Date.now().toString().slice(-6)}`;
    const newMap = await MitreMapping.create({
      mappingId,
      tacticId,
      tacticName: tacticName || 'Initial Access',
      techniqueId,
      techniqueName: techniqueName || 'Exploitation',
      linkedType: linkedType || 'GENERAL',
      linkedRef,
      evidence: evidence || `Manual mapping created by ${req.user?.email || 'analyst'}`,
      confidence: 'HIGH',
    });

    res.status(201).json({
      success: true,
      data: newMap.mapThreat(),
      mapping: newMap,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
