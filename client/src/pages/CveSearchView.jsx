import React, { useState, useEffect } from 'react';
import {
  Search,
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  BellRing,
  Filter,
  CheckCircle,
  X,
  FileCode,
  Calendar,
} from 'lucide-react';
import api from '../services/api';

const QUICK_SUGGESTIONS = [
  'CVE-2024-3094',
  'CVE-2023-44487',
  'CVE-2024-6387',
  'CVE-2024-21626',
  'Log4Shell',
];

const CveSearchView = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCve, setSelectedCve] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(null);

  const executeSearch = async (searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      setAlertSuccess(null);
      setHasSearched(true);
      const res = await api.get(`/cve/search?query=${encodeURIComponent(searchTerm)}`);
      if (res.data.success) {
        setResults(res.data.results || []);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to search CVE vulnerabilities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch(''); // Load baseline
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleTriggerAlert = async (cve) => {
    try {
      const res = await api.post(`/cve/${cve.cveId}/alert`);
      setAlertSuccess(`SOC Alert generated successfully for ${cve.cveId}!`);
      setTimeout(() => setAlertSuccess(null), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to trigger alert');
    }
  };

  const filteredResults = results.filter((cve) => {
    if (severityFilter !== 'ALL' && cve.severity !== severityFilter) return false;
    if (dateFrom) {
      const pubDate = new Date(cve.publishedDate);
      if (pubDate < new Date(dateFrom)) return false;
    }
    if (dateTo) {
      const pubDate = new Date(cve.publishedDate);
      if (pubDate > new Date(dateTo + 'T23:59:59')) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title & Sequence Diagram Context */}
      <div className="pb-2 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-cyan-400" />
            <span>CVE Vulnerability Intelligence (FR-02)</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Sequence Flow: Client Request &rarr; NVD API / Adapter &rarr; MongoDB Cache &rarr; 200 OK JSON
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">ALL SEVERITIES</option>
            <option value="CRITICAL">CRITICAL (&ge;9.0)</option>
            <option value="HIGH">HIGH (7.0 - 8.9)</option>
            <option value="MEDIUM">MEDIUM (4.0 - 6.9)</option>
          </select>
          <span className="text-xs text-slate-400 font-mono ml-2">From:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
          />
          <span className="text-xs text-slate-400 font-mono">To:</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      {alertSuccess && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-700 text-emerald-300 rounded-xl text-xs flex items-center space-x-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{alertSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-950/70 border border-rose-700 text-rose-300 rounded-xl text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="soc-glass-card rounded-2xl p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by CVE ID (e.g., CVE-2024-3094), software name, or keyword..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-cyan-900/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Querying NVD...' : 'Search CVEs'}</span>
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="mt-3 flex items-center flex-wrap gap-2 text-xs">
          <span className="text-slate-500 text-[11px] font-mono">Suggested:</span>
          {QUICK_SUGGESTIONS.map((item) => (
            <button
              key={item}
              onClick={() => {
                setQuery(item);
                executeSearch(item);
              }}
              className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px] font-mono transition"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="text-center py-12 space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Executing sequence diagram query against NVD API adapter...</p>
        </div>
      ) : filteredResults.length === 0 ? (
        /* Explicit "No CVEs found" empty state matching sequence diagram */
        <div className="soc-glass-card rounded-2xl p-12 text-center">
          <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">No CVEs found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-mono">
            {query
              ? `No vulnerability intelligence matched "${query}". Try searching for another CVE ID or vendor keyword.`
              : 'Enter a search term above to query the NVD database.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredResults.map((cve) => {
            const isCrit = cve.severity === 'CRITICAL' || cve.cvssScore >= 9.0;
            const isHigh = cve.severity === 'HIGH' || (cve.cvssScore >= 7.0 && cve.cvssScore < 9.0);

            return (
              <div
                key={cve.cveId}
                className="soc-glass-card rounded-xl p-4 transition hover:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="font-mono font-bold text-sm text-cyan-300">{cve.cveId}</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border uppercase ${
                        isCrit
                          ? 'bg-rose-950/80 text-rose-400 border-rose-700'
                          : isHigh
                          ? 'bg-amber-950/80 text-amber-400 border-amber-700'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      CVSS {cve.cvssScore} • {cve.severity}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {cve.cweId || 'CWE'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {cve.description}
                  </p>

                  <div className="flex items-center space-x-4 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{new Date(cve.publishedDate).toLocaleDateString()}</span>
                    </span>
                    {cve.affectedComponent && (
                      <span className="truncate max-w-xs text-slate-400">
                        Affected: {cve.affectedComponent}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end md:self-center flex-shrink-0">
                  {isCrit && (
                    <button
                      onClick={() => handleTriggerAlert(cve)}
                      title="Trigger SOC Alert for critical vulnerability"
                      className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-700/60 rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
                    >
                      <BellRing className="w-3.5 h-3.5" />
                      <span>Trigger Alert</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedCve(cve)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
                  >
                    <span>Inspect Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CVE Details Modal */}
      {selectedCve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f172a] border border-cyan-500/40 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedCve(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60 hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-mono">{selectedCve.cveId}</h2>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-xs font-mono font-bold text-rose-400">
                    CVSS Score: {selectedCve.cvssScore} ({selectedCve.severity})
                  </span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-400 font-mono">{selectedCve.cweId}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-semibold mb-1">Vulnerability Description</span>
                <p className="leading-relaxed text-slate-200">{selectedCve.description}</p>
              </div>

              {selectedCve.affectedComponent && (
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-semibold mb-1">Affected Component / CPE</span>
                  <p className="font-mono text-cyan-300">{selectedCve.affectedComponent}</p>
                </div>
              )}

              {selectedCve.references && selectedCve.references.length > 0 && (
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-semibold mb-2">Advisory References</span>
                  <ul className="space-y-1 font-mono text-[11px] text-cyan-400">
                    {selectedCve.references.map((ref, idx) => (
                      <li key={idx} className="truncate">
                        <a href={ref} target="_blank" rel="noreferrer" className="hover:underline flex items-center space-x-1">
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          <span>{ref}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={() => handleTriggerAlert(selectedCve)}
                className="px-3.5 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Trigger SOC Alert</span>
              </button>
              <button
                onClick={() => setSelectedCve(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CveSearchView;
