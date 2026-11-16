import React, { useState, useEffect } from 'react';
import {
  Grid,
  Shield,
  Plus,
  X,
  CheckCircle,
  AlertTriangle,
  Layers,
  ExternalLink,
  Tag,
  Crosshair,
} from 'lucide-react';
import api from '../services/api';

const MitreMatrixView = () => {
  const [matrix, setMatrix] = useState([]);
  const [allMappings, setAllMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State for manual mapping
  const [tacticId, setTacticId] = useState('TA0001');
  const [techniqueId, setTechniqueId] = useState('T1190');
  const [linkedType, setLinkedType] = useState('CVE');
  const [linkedRef, setLinkedRef] = useState('CVE-2024-3094');
  const [evidence, setEvidence] = useState('');

  const fetchMatrix = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/mitre/matrix');
      if (res.data.success) {
        setMatrix(res.data.matrix || []);
        setAllMappings(res.data.allMappings || []);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch MITRE ATT&CK matrix');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  const handleMapThreat = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const selectedTactic = matrix.find((t) => t.tacticId === tacticId);
      const selectedTech = selectedTactic?.techniques?.find((t) => t.techniqueId === techniqueId);

      const res = await api.post('/mitre/map', {
        tacticId,
        tacticName: selectedTactic?.tacticName || 'Initial Access',
        techniqueId,
        techniqueName: selectedTech?.techniqueName || 'Exploitation',
        linkedType,
        linkedRef,
        evidence,
      });

      if (res.data.success) {
        setModalOpen(false);
        setEvidence('');
        await fetchMatrix();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Mapping threat failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="pb-2 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Grid className="w-6 h-6 text-cyan-400" />
            <span>MITRE ATT&amp;CK Threat Matrix (FR-05)</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Enterprise Matrix Framework • Automatic &amp; Manual Tactic/Technique Threat Correlation
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-cyan-900/30 transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Map New Threat (mapThreat)</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/70 border border-rose-700 text-rose-300 rounded-xl text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Mapped Threats Summary */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3 text-xs">
          <span className="font-bold text-white font-mono">Total Active Mappings: {allMappings.length}</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400 font-mono">Pre-seeded Baseline: m1 (TA0001 / T1190)</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px] font-mono">
          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">CVEs Mapped</span>
          <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">IOCs Mapped</span>
          <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">Malware Mapped</span>
        </div>
      </div>

      {/* Interactive Matrix Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {matrix.map((tactic) => {
          const activeMaps = tactic.mappings || [];
          return (
            <div key={tactic.tacticId} className="soc-glass-card rounded-2xl p-4 flex flex-col justify-between">
              <div>
                {/* Column Header */}
                <div className="border-b border-slate-800 pb-2.5 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-400 font-bold border border-slate-800">
                      {tactic.tacticId}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {activeMaps.length} Active
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1.5">{tactic.tacticName}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{tactic.description}</p>
                </div>

                {/* Framework Techniques */}
                <div className="space-y-2 mb-4">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Core Techniques:
                  </span>
                  {tactic.techniques?.map((tech) => (
                    <div
                      key={tech.techniqueId}
                      className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 text-[11px] flex items-center justify-between"
                    >
                      <span className="text-slate-300 font-medium">{tech.techniqueName}</span>
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-1.5 py-0.2 rounded border border-indigo-900">
                        {tech.techniqueId}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Mapped Findings Cards */}
                {activeMaps.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                      Mapped Security Entities:
                    </span>
                    {activeMaps.map((mapItem) => {
                      const isCve = mapItem.linkedType === 'CVE';
                      const isMal = mapItem.linkedType === 'MALWARE';

                      return (
                        <div
                          key={mapItem.mappingId}
                          className="bg-slate-950 p-2.5 rounded-lg border border-cyan-500/30 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-cyan-300 text-[11px] truncate">
                              {mapItem.linkedRef}
                            </span>
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                                isCve
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : isMal
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                  : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                              }`}
                            >
                              {mapItem.linkedType}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-2">{mapItem.evidence}</p>
                          <span className="text-[9px] font-mono text-indigo-400 block">
                            Tech: {mapItem.techniqueId} - {mapItem.techniqueName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Mapping Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f172a] border border-cyan-500/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60 hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-5 border-b border-slate-800 pb-3">
              <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
                <Grid className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Manual Threat Mapping (mapThreat)</h2>
                <p className="text-xs text-slate-400 font-mono">UML MitreMapping Class Method</p>
              </div>
            </div>

            <form onSubmit={handleMapThreat} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Tactic</label>
                <select
                  value={tacticId}
                  onChange={(e) => {
                    setTacticId(e.target.value);
                    const sel = matrix.find((t) => t.tacticId === e.target.value);
                    if (sel?.techniques?.[0]) {
                      setTechniqueId(sel.techniques[0].techniqueId);
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                >
                  {matrix.map((t) => (
                    <option key={t.tacticId} value={t.tacticId}>
                      {t.tacticId} - {t.tacticName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Technique</label>
                <select
                  value={techniqueId}
                  onChange={(e) => setTechniqueId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                >
                  {matrix
                    .find((t) => t.tacticId === tacticId)
                    ?.techniques?.map((tech) => (
                      <option key={tech.techniqueId} value={tech.techniqueId}>
                        {tech.techniqueId} - {tech.techniqueName}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Entity Type</label>
                  <select
                    value={linkedType}
                    onChange={(e) => setLinkedType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="CVE">CVE Vulnerability</option>
                    <option value="IOC">Indicator of Compromise</option>
                    <option value="MALWARE">Malware Hash</option>
                    <option value="GENERAL">General Threat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Entity Reference</label>
                  <input
                    type="text"
                    value={linkedRef}
                    onChange={(e) => setLinkedRef(e.target.value)}
                    placeholder="CVE-2024-3094 or IP..."
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Evidence / Analyst Notes</label>
                <textarea
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  rows={3}
                  placeholder="Describe observed adversary behavior or exploitation mechanism..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add Mapping'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MitreMatrixView;
