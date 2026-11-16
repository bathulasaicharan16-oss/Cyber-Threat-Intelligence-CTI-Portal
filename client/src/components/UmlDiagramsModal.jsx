import React, { useState } from 'react';
import { X, Network, GitCommit, PlayCircle, GitFork, Boxes, Database, Share2, Layers } from 'lucide-react';

const UML_DATA = [
  {
    id: 'class',
    title: 'Class Diagram (Slide 17)',
    icon: Boxes,
    subtitle: 'Defines main domain classes, attributes, operations and relationships',
    summary: 'Models User, Role, CVE, IOC, MalwareSample, MitreMapping, Alert, Report, Dashboard, and ExternalAPIService.',
    entities: [
      { name: 'User', attrs: ['userId: String', 'email: String', 'passwordHash: String', 'role: Role'], methods: ['register()', 'login()', 'logout()'] },
      { name: 'CVE', attrs: ['cveId: String', 'description: String', 'cvssScore: Float', 'severity: String', 'publishedDate: Date'], methods: ['search()', 'getDetails()'] },
      { name: 'IOC', attrs: ['value: String', 'type: String', 'reputationScore: Float', 'abuseConfidence: Int', 'otxPulses: Array'], methods: ['investigate()', 'consolidate()'] },
      { name: 'MalwareSample', attrs: ['hash: String', 'fileName: String', 'detectionRatio: Float', 'malwareFamily: String', 'tags: Array'], methods: ['analyze()', 'getHistory()'] },
      { name: 'MitreMapping', attrs: ['tacticId: String', 'tacticName: String', 'techniqueId: String', 'techniqueName: String'], methods: ['mapThreat()'] },
      { name: 'Alert', attrs: ['alertId: String', 'title: String', 'severity: String', 'status: String', 'sourceRef: String'], methods: ['dismiss()', 'markRead()'] },
      { name: 'Report', attrs: ['reportId: String', 'title: String', 'createdDate: Date', 'format: String', 'records: Object'], methods: ['generate()', 'export()'] },
      { name: 'ExternalAPIService', attrs: ['endpoint: String', 'apiKey: String'], methods: ['fetchNVD()', 'fetchVirusTotal()', 'fetchOTX()', 'fetchAbuseIPDB()'] },
    ],
  },
  {
    id: 'object',
    title: 'Object Diagram (Slide 18)',
    icon: Database,
    subtitle: 'Example object instances and links at a particular point in time (Pre-seeded Demo State)',
    summary: 'Depicts real runtime memory instances initialized in database.',
    entities: [
      { name: 'analyst1 : User', attrs: ['email = "a.rao@soc.org"', 'role = SECURITY_ANALYST'] },
      { name: 'cve1 : CVE', attrs: ['cveId = "CVE-2024-3094"', 'cvssScore = 10.0', 'severity = "CRITICAL"'] },
      { name: 'ioc1 : IOC', attrs: ['value = "185.220.101.4"', 'type = "IP"', 'abuseConfidence = 97'] },
      { name: 'mal1 : MalwareSample', attrs: ['hash = "44d88612fea8a8f36de82e1278abb02f"', 'detectionRatio = 0.82'] },
      { name: 'm1 : MitreMapping', attrs: ['tacticId = "TA0001"', 'techniqueId = "T1190"'] },
      { name: 'alert1 : Alert', attrs: ['severity = "HIGH"', 'status = "UNREAD"'] },
      { name: 'report1 : Report', attrs: ['reportId = "R-0007"', 'format = "PDF"'] },
    ],
  },
  {
    id: 'statemachine',
    title: 'State Machine Diagram (Slide 19)',
    icon: GitCommit,
    subtitle: 'Models Alert Lifecycle & User Session States',
    flows: [
      {
        title: 'User Session State Machine',
        steps: [
          'Anonymous: User is unauthenticated, visitor state.',
          'Authenticating: Analyst enters credentials, backend verifies hash & creates audit log.',
          'Authenticated: User session active with assigned RBAC role (SECURITY_ANALYST / SOC_TEAM / TI_RESEARCHER).',
          'Logout / Session Timeout: Revokes JWT bearer token and safely transitions back to Anonymous.',
        ],
      },
      {
        title: 'Alert Lifecycle State Machine',
        steps: [
          'Criteria Matched: AbuseConfidence >= 80, CVSS >= 9.0, or malware detection ratio >= 0.50 triggers alert.',
          'Generated: Alert record created by CorrelationEngine with source reference.',
          'Unread: Shown to analyst in dashboard with active pulse indicator.',
          'Read: Analyst inspects alert details and invokes markRead().',
          'Dismissed: Incident resolved, analyst invokes dismiss() to archive.',
        ],
      },
    ],
  },
  {
    id: 'sequence',
    title: 'Sequence Diagram (Slide 14)',
    icon: PlayCircle,
    subtitle: 'Order of messages during CVE Search and data retrieval',
    flows: [
      {
        title: 'CVE Search Sequence Flow',
        steps: [
          '1. Security Analyst enters search criteria in Web Client.',
          '2. React Frontend dispatches GET /api/cve/search?query=... over HTTPS.',
          '3. Application Server validates input and dispatches request to NVD API over HTTPS.',
          '4. NVD API returns vulnerability JSON payload.',
          '5. Server caches query and saves findings in MongoDB.',
          '6. MongoDB responds with write acknowledgement.',
          '7. Server returns 200 OK JSON with CVSS metrics and severity.',
          '8. React SPA renders responsive CVE results table (or "No CVEs found" empty state).',
        ],
      },
    ],
  },
  {
    id: 'communication',
    title: 'Communication Diagram (Slide 16)',
    icon: Share2,
    subtitle: 'Numbered IOC investigation messages between cooperating objects',
    flows: [
      {
        title: 'IOC Investigation Multi-Source Messages',
        steps: [
          '1: enterIOC() -> Security Analyst submits IP/Domain to :IOC Search UI.',
          '2: GET /ioc / POST /api/ioc/investigate -> Frontend calls :API Server.',
          '3: queryPulses() -> Server invokes AlienVault :OTX Client.',
          '4: queryReputation() -> Server invokes :AbuseIPDB Client.',
          '5: saveResult() -> Server consolidates score and persists to :MongoDB.',
          '6: result() -> Server responds with normalized reputation score.',
          '7: render() -> UI renders consolidated threat score and threat pulse badges.',
        ],
      },
    ],
  },
  {
    id: 'activity',
    title: 'Activity Diagram (Slide 15)',
    icon: GitFork,
    subtitle: 'Report Generation Workflow and Decision Points',
    flows: [
      {
        title: 'Multi-Step Threat Report Generation Flow',
        steps: [
          'Step 1: User selects CVE, Malware, and IOC records via checkboxes.',
          'Step 2: Analyst clicks "Generate Threat Report".',
          'Decision: Are selected records valid (>0) AND user has RBAC rights (TI_RESEARCHER)?',
          'Branch [NO]: Render access-denied (403) or validation error toast.',
          'Branch [YES]: Aggregate CVEs, IOCs, Malware telemetry, and correlate linked MITRE ATT&CK mappings.',
          'Step 3: Compile structured report content and format headers.',
          'Step 4: Export report as downloadable PDF using PDFKit.',
          'Step 5: Store Report record in MongoDB with timestamp and author metadata.',
          'Step 6: Notify user with instant download link and toast notification.',
        ],
      },
    ],
  },
  {
    id: 'usecase',
    title: 'Use Case Diagram (Slide 13)',
    icon: Network,
    subtitle: 'Actors and functions in the Cyber Threat Intelligence Portal',
    flows: [
      {
        title: 'Actor Permissions & Boundaries',
        steps: [
          'SECURITY_ANALYST: Register & Login, Search CVEs, Investigate IOCs, Analyze Malware Samples, View MITRE Mappings.',
          'SOC_TEAM: View Operational Dashboard, Review MITRE ATT&CK Mappings, Receive & Dismiss Real-Time Alerts.',
          'TI_RESEARCHER: Investigate Threats, Compile Findings, Generate PDF Reports, Export & Retrieve Reports.',
          'RBAC System Boundary: All privileged operations are guarded by backend JWT claims.',
        ],
      },
    ],
  },
  {
    id: 'deployment',
    title: 'Deployment Diagram (Slide 20)',
    icon: Layers,
    subtitle: 'Maps the portal to Client, Application, Database, and External API Nodes',
    flows: [
      {
        title: 'Node Topology & Protocols',
        steps: [
          'Client Device <<node>>: Modern Web Browser (React SPA on Vite) over HTTPS.',
          'Application Server <<node>>: Node.js + Express REST API server hosting threat adapters.',
          'Database Server <<node>>: MongoDB / In-memory Mongoose persistence over MongoDB driver TCP.',
          'External Intelligence Nodes: NVD API, VirusTotal API, AlienVault OTX API, AbuseIPDB API over HTTPS/TLS.',
          'Security Boundary: All external API keys and JWT signing secrets kept strictly server-side.',
        ],
      },
    ],
  },
];

const UmlDiagramsModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('class');

  if (!isOpen) return null;

  const currentDiagram = UML_DATA.find((d) => d.id === activeTab) || UML_DATA[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">UML Architecture & Design Specifications</h2>
              <p className="text-xs text-slate-400 font-mono">BCS 502 Project • 8 UML Diagrams (Slides 13–20)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex overflow-x-auto space-x-1.5 pb-2 mb-4 scrollbar-thin border-b border-slate-800/60">
          {UML_DATA.map((diag) => {
            const Icon = diag.icon;
            const isActive = activeTab === diag.id;
            return (
              <button
                key={diag.id}
                onClick={() => setActiveTab(diag.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{diag.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Content Pane */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span>{currentDiagram.title}</span>
            </h3>
            <p className="text-xs text-cyan-400 font-mono mt-0.5">{currentDiagram.subtitle}</p>
            {currentDiagram.summary && (
              <p className="text-xs text-slate-300 mt-2">{currentDiagram.summary}</p>
            )}
          </div>

          {/* If entities exists (Class / Object Diagram) */}
          {currentDiagram.entities && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {currentDiagram.entities.map((ent, idx) => (
                <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col">
                  <div className="border-b border-slate-800 pb-1.5 mb-2">
                    <span className="font-bold text-xs text-cyan-300 font-mono">{ent.name}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-300 space-y-0.5 mb-2">
                    {ent.attrs?.map((a, i) => (
                      <p key={i} className="truncate">• {a}</p>
                    ))}
                  </div>
                  {ent.methods && (
                    <div className="border-t border-slate-800/60 pt-1.5 mt-auto text-[11px] font-mono text-indigo-400">
                      {ent.methods.map((m, i) => (
                        <p key={i}>+ {m}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* If flows exist (Sequence, Activity, State, Use Case, Deployment) */}
          {currentDiagram.flows && (
            <div className="space-y-4">
              {currentDiagram.flows.map((flow, fIdx) => (
                <div key={fIdx} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">
                    {flow.title}
                  </h4>
                  <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside">
                    {flow.steps.map((step, sIdx) => (
                      <li key={sIdx} className="leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                        <span className="text-slate-200">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Implemented strictly in accordance with BCS 502 Project Guidelines</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
          >
            Close Diagram
          </button>
        </div>
      </div>
    </div>
  );
};

export default UmlDiagramsModal;
