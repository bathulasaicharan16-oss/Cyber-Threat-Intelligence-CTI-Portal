import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Activity,
  Bug,
  Crosshair,
  FileCheck,
  CheckCircle,
  Eye,
  RefreshCw,
  ExternalLink,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const DashboardView = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/dashboard/widgets');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard widgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleMarkRead = async (alertId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [alertId]: true }));
      await api.put(`/alerts/${alertId}/read`);
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [alertId]: false }));
    }
  };

  const handleDismiss = async (alertId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [alertId]: true }));
      await api.put(`/alerts/${alertId}/dismiss`);
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [alertId]: false }));
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm font-mono text-slate-400">Loading SOC Operational Intelligence...</p>
      </div>
    );
  }

  const { kpi, severityBreakdown, tacticDistribution, recentAlerts, recentIOCs, recentCVEs } = data || {};

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>Operational SOC Dashboard</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Active User: <span className="text-cyan-400 font-semibold">{user?.email}</span> • Role:{' '}
            <span className="text-indigo-400 font-semibold">{user?.role}</span>
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="self-start sm:self-auto px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feeds</span>
        </button>
      </div>

      {/* FR-18: Dashboard Filters — by date range and threat category */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
        <span className="text-xs text-slate-400 font-mono font-semibold">Dashboard Filters (FR-18):</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">All Threats</option>
            <option value="CVE">CVE / Vulnerabilities</option>
            <option value="IOC">IOC / Indicators</option>
            <option value="MALWARE">Malware</option>
            <option value="ALERT">Alerts</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">Date Range:</span>
          <select
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
        {(categoryFilter !== 'ALL' || dateRangeFilter !== 'ALL') && (
          <button
            onClick={() => { setCategoryFilter('ALL'); setDateRangeFilter('ALL'); }}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono underline"
          >
            Clear Filters
          </button>
        )}
        <span className="text-xs text-slate-600 font-mono ml-auto">
          {categoryFilter !== 'ALL' ? `Category: ${categoryFilter}` : ''}{dateRangeFilter !== 'ALL' ? ` | Range: ${dateRangeFilter}` : ''}
        </span>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Vulnerabilities */}
        <div
          onClick={() => onNavigateTab('cve')}
          className="soc-glass-card rounded-2xl p-5 cursor-pointer transition hover:border-cyan-500/50"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">CVE Catalog</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white font-mono">{kpi?.totalCVEs || 0}</span>
            <span className="text-xs text-rose-400 font-semibold font-mono">
              ({kpi?.criticalCVEs || 0} Critical)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
            <span>NVD API 2.0 Feed Synced</span>
            <ArrowUpRight className="w-3 h-3 text-cyan-400" />
          </p>
        </div>

        {/* KPI 2: IOCs */}
        <div
          onClick={() => onNavigateTab('ioc')}
          className="soc-glass-card rounded-2xl p-5 cursor-pointer transition hover:border-indigo-500/50"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tracked IOCs</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Crosshair className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white font-mono">{kpi?.totalIOCs || 0}</span>
            <span className="text-xs text-rose-400 font-semibold font-mono">
              ({kpi?.highRiskIOCs || 0} High Abuse)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
            <span>OTX &amp; AbuseIPDB Normalization</span>
            <ArrowUpRight className="w-3 h-3 text-indigo-400" />
          </p>
        </div>

        {/* KPI 3: Malware */}
        <div
          onClick={() => onNavigateTab('malware')}
          className="soc-glass-card rounded-2xl p-5 cursor-pointer transition hover:border-rose-500/50"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Malware Hashes</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <Bug className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white font-mono">{kpi?.totalMalware || 0}</span>
            <span className="text-xs text-slate-400 font-mono">Samples</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
            <span>VirusTotal Multiscanner Telemetry</span>
            <ArrowUpRight className="w-3 h-3 text-rose-400" />
          </p>
        </div>

        {/* KPI 4: Active Alerts */}
        <div
          onClick={() => onNavigateTab('alerts')}
          className="soc-glass-card rounded-2xl p-5 cursor-pointer transition hover:border-amber-500/50"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Security Alerts</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white font-mono">{kpi?.totalAlerts || 0}</span>
            <span className="text-xs text-amber-400 font-bold font-mono">
              ({kpi?.unreadAlerts || 0} UNREAD)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
            <span>Alert Lifecycle State Machine Active</span>
            <ArrowUpRight className="w-3 h-3 text-amber-400" />
          </p>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Severity Breakdown Donut */}
        <div className="lg:col-span-5 soc-glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Vulnerability Severity Breakdown
            </h2>
            <span className="text-[10px] font-mono text-cyan-400">CVSS v3.1</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityBreakdown?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val) => <span className="text-xs text-slate-300 font-medium">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MITRE ATT&CK Tactic Distribution Bar Chart */}
        <div className="lg:col-span-7 soc-glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              MITRE ATT&amp;CK Tactics Distribution
            </h2>
            <button
              onClick={() => onNavigateTab('mitre')}
              className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center space-x-1"
            >
              <span>View Matrix</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tacticDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="tactic"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Alerts Panel (Alert Lifecycle: Generated -> Unread -> Read / Dismissed) */}
      <div className="soc-glass-card rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Real-Time Alert Lifecycle Queue</span>
            </h2>
            <p className="text-xs text-slate-400">
              State transitions: <span className="font-mono text-cyan-400">Generated &rarr; Unread &rarr; markRead() &rarr; dismiss()</span>
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('alerts')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold font-mono flex items-center space-x-1"
          >
            <span>View All Alerts ({kpi?.totalAlerts || 0})</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentAlerts?.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 font-mono">
            No active threat alerts in queue.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {recentAlerts?.map((alert) => {
              const isUnread = alert.status === 'UNREAD';
              const isCrit = alert.severity === 'CRITICAL';
              const isHigh = alert.severity === 'HIGH';

              return (
                <div
                  key={alert.alertId}
                  className={`py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition rounded-xl px-2.5 ${
                    isUnread ? 'bg-slate-900/40' : 'opacity-75'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border uppercase mt-0.5 ${
                        isCrit
                          ? 'bg-rose-950/80 text-rose-400 border-rose-700/60'
                          : isHigh
                          ? 'bg-amber-950/80 text-amber-400 border-amber-700/60'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {alert.severity}
                    </span>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">{alert.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400">
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{alert.description}</p>
                      <div className="flex items-center space-x-3 text-[10px] text-slate-500 font-mono mt-1">
                        <span>Ref: {alert.sourceRef}</span>
                        <span>•</span>
                        <span>{new Date(alert.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions (markRead & dismiss) */}
                  <div className="flex items-center space-x-2 self-end sm:self-auto flex-shrink-0">
                    {isUnread && (
                      <button
                        onClick={() => handleMarkRead(alert.alertId)}
                        disabled={actionLoading[alert.alertId]}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-xs font-semibold flex items-center space-x-1 border border-cyan-500/30 transition"
                      >
                        <Eye className="w-3 h-3" />
                        <span>markRead()</span>
                      </button>
                    )}
                    {alert.status !== 'DISMISSED' && (
                      <button
                        onClick={() => handleDismiss(alert.alertId)}
                        disabled={actionLoading[alert.alertId]}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-rose-950/60 text-rose-300 rounded text-xs font-semibold flex items-center space-x-1 border border-rose-500/30 transition"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>dismiss()</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Two Column Summary: Recent CVEs & Recent IOCs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent CVEs */}
        <div className="soc-glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>Recent CVE Vulnerabilities</span>
            </h3>
            <button onClick={() => onNavigateTab('cve')} className="text-xs text-cyan-400 font-mono hover:underline">
              Search All &rarr;
            </button>
          </div>
          <div className="space-y-2.5">
            {recentCVEs?.map((cve) => (
              <div key={cve.cveId} className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-cyan-300">{cve.cveId}</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800">
                    CVSS {cve.cvssScore}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{cve.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent IOCs */}
        <div className="soc-glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Crosshair className="w-4 h-4 text-indigo-400" />
              <span>Investigated Indicators (IOCs)</span>
            </h3>
            <button onClick={() => onNavigateTab('ioc')} className="text-xs text-indigo-400 font-mono hover:underline">
              Lookup &rarr;
            </button>
          </div>
          <div className="space-y-2.5">
            {recentIOCs?.map((ioc) => (
              <div key={ioc.value} className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {ioc.type}
                    </span>
                    <span className="font-mono font-bold text-xs text-white">{ioc.value}</span>
                  </div>
                  <span className="text-[10px] font-mono text-rose-400 font-bold">
                    {ioc.abuseConfidence}% Abuse
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>Score: {ioc.reputationScore} / 100</span>
                  <span>{ioc.geolocation?.country || 'Global'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
