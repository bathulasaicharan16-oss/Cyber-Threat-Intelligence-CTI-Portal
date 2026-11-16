import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  CheckCircle,
  AlertTriangle,
  Shield,
  Layers,
  Clock,
  Sparkles,
  Lock,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ReportsView = () => {
  const { user, switchDemoRole } = useAuth();
  
  // Selection state for Activity Diagram Multi-step builder
  const [cves, setCves] = useState([]);
  const [iocs, setIocs] = useState([]);
  const [malware, setMalware] = useState([]);
  const [reportsList, setReportsList] = useState([]);

  const [selectedCves, setSelectedCves] = useState([]);
  const [selectedIocs, setSelectedIocs] = useState([]);
  const [selectedMalware, setSelectedMalware] = useState([]);

  const [reportTitle, setReportTitle] = useState('');
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  const isResearcher = user?.role === 'TI_RESEARCHER';

  const loadData = async () => {
    try {
      const [cveRes, iocRes, malRes, repRes] = await Promise.all([
        api.get('/cve/search?query='),
        api.get('/ioc/history'),
        api.get('/malware/history'),
        api.get('/reports'),
      ]);

      if (cveRes.data.success) {
        setCves(cveRes.data.results || []);
        // Pre-select cve1 (CVE-2024-3094) matching Object Diagram
        const cve1 = cveRes.data.results?.find((c) => c.cveId === 'CVE-2024-3094');
        if (cve1) setSelectedCves([cve1.cveId]);
      }

      if (iocRes.data.success) {
        setIocs(iocRes.data.data || []);
        // Pre-select ioc1 (185.220.101.4)
        const ioc1 = iocRes.data.data?.find((i) => i.value === '185.220.101.4');
        if (ioc1) setSelectedIocs([ioc1.value]);
      }

      if (malRes.data.success) {
        setMalware(malRes.data.data || []);
        // Pre-select mal1
        const mal1 = malRes.data.data?.find((m) => m.hash.includes('44d88'));
        if (mal1) setSelectedMalware([mal1.hash]);
      }

      if (repRes.data.success) {
        setReportsList(repRes.data.data || []);
      }
    } catch (err) {
      console.warn('Error loading records for report builder:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleCve = (id) => {
    setSelectedCves((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleIoc = (val) => {
    setSelectedIocs((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
  };

  const handleToggleMal = (hash) => {
    setSelectedMalware((prev) =>
      prev.includes(hash) ? prev.filter((x) => x !== hash) : [...prev, hash]
    );
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessToast(null);

    // Activity Diagram Decision Point: Are records valid & RBAC OK?
    if (!isResearcher) {
      setError(
        `RBAC Access Denied: Only Threat Intelligence Researchers ('TI_RESEARCHER') can generate threat reports. Current role: '${user?.role}'. Switch to TI Researcher role to proceed.`
      );
      return;
    }

    if (selectedCves.length + selectedIocs.length + selectedMalware.length === 0) {
      setError('Validation Error: Please select at least one CVE, IOC, or Malware sample to compile.');
      return;
    }

    try {
      setGenerating(true);
      const res = await api.post('/reports/generate', {
        title: reportTitle.trim() || undefined,
        executiveSummary: executiveSummary.trim() || undefined,
        selectedCveIds: selectedCves,
        selectedIocValues: selectedIocs,
        selectedMalwareHashes: selectedMalware,
      });

      if (res.data.success) {
        const generatedRep = res.data.reportDoc;
        setSuccessToast(`Report ${generatedRep.reportId} generated successfully! Ready for download.`);
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.8 } });
        
        // Trigger auto download of PDF
        window.open(`/api/reports/${generatedRep.reportId}/export`, '_blank');
        
        // Refresh reports list
        const repRes = await api.get('/reports');
        if (repRes.data.success) setReportsList(repRes.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title & Activity Diagram Context */}
      <div className="pb-2 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <FileText className="w-6 h-6 text-purple-400" />
            <span>Threat Intelligence Report Builder (FR-08)</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Activity Diagram: Select Records &rarr; Validate RBAC (TI_RESEARCHER) &rarr; Aggregate &rarr; Export PDF &rarr; Store in MongoDB
          </p>
        </div>

        {/* RBAC Role Indicator */}
        <div className="flex items-center space-x-2">
          {isResearcher ? (
            <div className="px-3 py-1 bg-purple-950/80 border border-purple-600/60 rounded-xl text-purple-300 text-xs font-mono flex items-center space-x-1.5 font-bold">
              <UserCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>RBAC Authorized: TI_RESEARCHER</span>
            </div>
          ) : (
            <button
              onClick={() => switchDemoRole('TI_RESEARCHER')}
              className="px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-600/60 rounded-xl text-amber-300 text-xs font-mono flex items-center space-x-1.5 transition"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Switch to TI_RESEARCHER (1-Click)</span>
            </button>
          )}
        </div>
      </div>

      {successToast && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-600 text-emerald-300 rounded-2xl text-xs flex items-center justify-between animate-fadeIn shadow-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="font-semibold text-white">{successToast}</span>
          </div>
          <span className="text-[10px] font-mono bg-emerald-900 text-white px-2 py-1 rounded">
            PDF GENERATED
          </span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/80 border border-rose-600 text-rose-300 rounded-2xl text-xs flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
          <div>
            <p className="font-bold text-white">Validation / Access Denied</p>
            <p className="mt-0.5 leading-relaxed">{error}</p>
            {!isResearcher && (
              <button
                onClick={() => switchDemoRole('TI_RESEARCHER')}
                className="mt-2 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-[11px] flex items-center space-x-1 transition"
              >
                <span>Switch to TI_RESEARCHER Demo Account</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Multi-Step Report Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step 1: Record Selection Checkboxes (Left 7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="soc-glass-card rounded-2xl p-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Step 1: Select Records to Include</span>
              <span className="text-xs font-mono text-cyan-400">
                {selectedCves.length + selectedIocs.length + selectedMalware.length} Selected
              </span>
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Tick checkboxes to include verified vulnerability data, network indicators, and malware artifacts.
            </p>

            {/* Checkbox Group A: CVEs */}
            <div className="space-y-2 mb-4">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                CVE Vulnerabilities ({cves.length})
              </span>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {cves.map((c) => (
                  <label
                    key={c.cveId}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition text-xs ${
                      selectedCves.includes(c.cveId)
                        ? 'bg-cyan-950/40 border-cyan-500/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="checkbox"
                        checked={selectedCves.includes(c.cveId)}
                        onChange={() => handleToggleCve(c.cveId)}
                        className="rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-900"
                      />
                      <span className="font-mono font-bold text-cyan-300">{c.cveId}</span>
                      <span className="text-[11px] text-slate-400 truncate max-w-xs">{c.description}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 font-bold border border-rose-800">
                      CVSS {c.cvssScore}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Checkbox Group B: IOCs */}
            <div className="space-y-2 mb-4">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Indicators of Compromise (IOCs) ({iocs.length})
              </span>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {iocs.map((i) => (
                  <label
                    key={i.value}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition text-xs ${
                      selectedIocs.includes(i.value)
                        ? 'bg-indigo-950/40 border-indigo-500/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="checkbox"
                        checked={selectedIocs.includes(i.value)}
                        onChange={() => handleToggleIoc(i.value)}
                        className="rounded border-slate-700 text-indigo-500 focus:ring-0 bg-slate-900"
                      />
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-bold">
                        {i.type}
                      </span>
                      <span className="font-mono text-white font-medium">{i.value}</span>
                    </div>
                    <span className="text-[10px] font-mono text-rose-400 font-bold">
                      {i.abuseConfidence}% Abuse
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Checkbox Group C: Malware */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Malware Samples ({malware.length})
              </span>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {malware.map((m) => (
                  <label
                    key={m.hash}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition text-xs ${
                      selectedMalware.includes(m.hash)
                        ? 'bg-rose-950/40 border-rose-500/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="checkbox"
                        checked={selectedMalware.includes(m.hash)}
                        onChange={() => handleToggleMal(m.hash)}
                        className="rounded border-slate-700 text-rose-500 focus:ring-0 bg-slate-900"
                      />
                      <span className="font-bold text-white">{m.fileName}</span>
                      <span className="text-[11px] font-mono text-slate-400 truncate max-w-xs">{m.hash}</span>
                    </div>
                    <span className="text-[10px] font-mono text-rose-400 font-bold">
                      {(m.detectionRatio * 100).toFixed(0)}% Det
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Compile & PDF Export Config (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="soc-glass-card rounded-2xl p-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Step 2: Compile &amp; Export Report
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Enter briefing details. Backend compiles PDF with Amity University project metadata.
            </p>

            <form onSubmit={handleGenerateReport} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Report Title</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="e.g. Q4 Perimeter Threat Assessment &amp; XZ Backdoor"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Executive Threat Summary</label>
                <textarea
                  value={executiveSummary}
                  onChange={(e) => setExecutiveSummary(e.target.value)}
                  rows={4}
                  placeholder="Provide incident response context, impact assessment, and defensive posture recommendations..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              {/* Compilation Metadata preview */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1 text-slate-400">
                <p>• Output Format: <span className="text-white">Adobe PDF (A4)</span></p>
                <p>• Linked MITRE Mappings: <span className="text-cyan-400">Auto-correlated</span></p>
                <p>• Supervisor Credit: <span className="text-indigo-300">Dr. Deepti Saxena</span></p>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-extrabold rounded-xl shadow-lg shadow-purple-900/40 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{generating ? 'Compiling PDF...' : 'Generate & Download PDF'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Generated Reports History (Pre-seeded report1: R-0007) */}
      <div className="soc-glass-card rounded-2xl p-5">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-purple-400" />
          <span>Historical Threat Intelligence Reports</span>
        </h3>

        <div className="divide-y divide-slate-800/80">
          {reportsList.map((r) => (
            <div
              key={r.reportId}
              className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-purple-400 bg-purple-950/70 border border-purple-800 px-2 py-0.5 rounded text-[11px]">
                    {r.reportId}
                  </span>
                  <span className="font-bold text-white text-sm">{r.title}</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">{r.executiveSummary}</p>
                <div className="flex items-center space-x-3 text-[10px] text-slate-500 font-mono">
                  <span>Author: {r.authorName || 'TI Researcher'}</span>
                  <span>•</span>
                  <span>Date: {new Date(r.createdDate).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>
                    Records: {r.records?.cves?.length || 0} CVEs, {r.records?.iocs?.length || 0} IOCs,{' '}
                    {r.records?.malwareSamples?.length || 0} Malware
                  </span>
                </div>
              </div>

              <a
                href={`/api/reports/${r.reportId}/export`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-purple-950 text-purple-300 border border-purple-600/40 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
