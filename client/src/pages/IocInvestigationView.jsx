import React, { useState, useEffect } from 'react';
import {
  Crosshair,
  Globe,
  ShieldAlert,
  AlertTriangle,
  Radio,
  Clock,
  Layers,
  CheckCircle,
  ExternalLink,
  MapPin,
  Server,
  Zap,
} from 'lucide-react';
import api from '../services/api';

const QUICK_IOCS = [
  { val: '185.220.101.4', type: 'IP', label: '185.220.101.4 (Pre-seeded Tor C2)' },
  { val: 'dark-update.biz', type: 'DOMAIN', label: 'dark-update.biz (Phishing)' },
  { val: '194.26.29.112', type: 'IP', label: '194.26.29.112 (Scanner)' },
];

const IocInvestigationView = () => {
  const [inputValue, setInputValue] = useState('185.220.101.4');
  const [selectedType, setSelectedType] = useState('IP');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alertTriggered, setAlertTriggered] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/ioc/history');
      if (res.data.success) {
        setHistory(res.data.data || []);
      }
    } catch (err) {
      console.warn('Failed to fetch IOC history');
    }
  };

  useEffect(() => {
    fetchHistory();
    handleInvestigate('185.220.101.4', 'IP'); // Default load
  }, []);

  const handleInvestigate = async (valToQuery, typeToQuery) => {
    const targetVal = valToQuery || inputValue;
    if (!targetVal.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setAlertTriggered(false);

      const res = await api.post('/ioc/investigate', {
        value: targetVal.trim(),
        type: typeToQuery || selectedType,
      });

      if (res.data.success) {
        setResult(res.data.data);
        setAlertTriggered(res.data.alertGenerated);
        await fetchHistory();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Investigation failed');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 80) return 'text-rose-400 bg-rose-950/80 border-rose-700';
    if (score >= 50) return 'text-amber-400 bg-amber-950/80 border-amber-700';
    return 'text-emerald-400 bg-emerald-950/80 border-emerald-700';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title & Communication Diagram Note */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <Crosshair className="w-6 h-6 text-indigo-400" />
          <span>IOC Reputation &amp; Normalization (FR-03 &amp; FR-04)</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Communication Diagram Flow: 1: enterIOC() &rarr; 3: queryPulses() (OTX) + 4: queryReputation() (AbuseIPDB) &rarr; 5: consolidate() &rarr; 7: render()
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/70 border border-rose-700 text-rose-300 rounded-xl text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Form */}
      <div className="soc-glass-card rounded-2xl p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleInvestigate();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2.5 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="IP">IP Address</option>
            <option value="DOMAIN">Domain Name</option>
            <option value="URL">Full URL</option>
            <option value="HASH">File Hash</option>
          </select>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter indicator (e.g. 185.220.101.4 or domain)..."
            required
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition"
          />

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-900/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{loading ? 'Correlating...' : 'Investigate IOC'}</span>
          </button>
        </form>

        {/* Quick Baseline Picks */}
        <div className="mt-3 flex items-center flex-wrap gap-2 text-xs">
          <span className="text-slate-500 text-[11px] font-mono">Quick Test:</span>
          {QUICK_IOCS.map((item) => (
            <button
              key={item.val}
              onClick={() => {
                setInputValue(item.val);
                setSelectedType(item.type);
                handleInvestigate(item.val, item.type);
              }}
              className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-[11px] font-mono transition"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Auto-Alert Trigger Notification */}
      {alertTriggered && (
        <div className="p-4 bg-rose-950/70 border border-rose-600 text-rose-300 rounded-2xl text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-white">Automated SOC Alert Triggered</p>
              <p className="text-[11px] text-rose-300">
                Abuse confidence reached &ge;80%. Correlation engine automatically created an UNREAD incident in the Alert Lifecycle queue.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-1 bg-rose-900 text-white rounded font-bold">
            ALT-TRIGGERED
          </span>
        </div>
      )}

      {/* Investigation Result Card */}
      {result && (
        <div className="soc-glass-card rounded-2xl p-6 space-y-6">
          {/* Top Result Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-extrabold text-lg text-white">{result.value}</span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-700 rounded uppercase">
                    {result.type}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Last verified: {new Date(result.updatedAt || Date.now()).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Consolidated Reputation Score Badge */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Consolidated Reputation
                </span>
                <span className="text-xs text-slate-500 font-mono">Weighted Normalization</span>
              </div>
              <div className={`px-4 py-2 rounded-xl border text-xl font-extrabold font-mono ${scoreColor(result.reputationScore)}`}>
                {result.reputationScore} / 100
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">AbuseIPDB Confidence</span>
              <span className="text-xl font-bold font-mono text-rose-400">{result.abuseConfidence}%</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Reported malicious activity</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">AlienVault OTX Pulses</span>
              <span className="text-xl font-bold font-mono text-cyan-400">{result.otxPulses?.length || 0} Pulses</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Threat intelligence feeds</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Location &amp; Country</span>
              <span className="text-sm font-bold text-white flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{result.geolocation?.country || 'Germany (DE)'}</span>
              </span>
              <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{result.geolocation?.city || 'Jena'}</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">ISP / Transit Autonomous System</span>
              <span className="text-xs font-bold text-slate-300 truncate block">
                {result.geolocation?.isp || 'Zwiebelfreunde e.V.'}
              </span>
              <p className="text-[10px] text-slate-500 mt-0.5 font-mono">Known Tor Relay</p>
            </div>
          </div>

          {/* OTX Threat Pulses Section */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>Correlated AlienVault OTX Threat Pulses</span>
            </h3>

            {result.otxPulses?.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono">No active threat pulses linked to this indicator.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.otxPulses.map((pulse, idx) => (
                  <div key={idx} className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white line-clamp-1">{pulse.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400">
                        {pulse.adversary || 'APT'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">Author: {pulse.author || 'AlienVault Labs'}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pulse.tags?.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[9px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Investigation History Table */}
      <div className="soc-glass-card rounded-2xl p-5">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Recent IOC Investigations History</span>
        </h3>
        <div className="divide-y divide-slate-800/80">
          {history.map((item) => (
            <div
              key={item.value}
              onClick={() => {
                setInputValue(item.value);
                setSelectedType(item.type);
                handleInvestigate(item.value, item.type);
              }}
              className="py-2.5 px-2 hover:bg-slate-900/60 rounded-lg cursor-pointer flex items-center justify-between transition text-xs"
            >
              <div className="flex items-center space-x-3">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400">
                  {item.type}
                </span>
                <span className="font-mono text-white font-medium">{item.value}</span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  {item.geolocation?.country}
                </span>
              </div>
              <div className="flex items-center space-x-3 font-mono">
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${scoreColor(item.reputationScore)}`}>
                  {item.reputationScore} / 100
                </span>
                <span className="text-slate-400">&rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IocInvestigationView;
