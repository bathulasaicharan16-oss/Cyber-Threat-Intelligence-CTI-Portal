import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle,
  Eye,
  Trash2,
  Filter,
  AlertTriangle,
  RefreshCw,
  GitCommit,
  ShieldAlert,
} from 'lucide-react';
import api from '../services/api';

const AlertsView = ({ onAlertCountChange }) => {
  const [alerts, setAlerts] = useState([]);
  const [counts, setCounts] = useState({ total: 0, unread: 0, critical: 0, high: 0 });
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/alerts?status=${statusFilter}&severity=${severityFilter}`);
      if (res.data.success) {
        setAlerts(res.data.data || []);
        if (res.data.counts) {
          setCounts(res.data.counts);
          onAlertCountChange?.(res.data.counts.unread);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter, severityFilter]);

  const handleMarkRead = async (alertId) => {
    try {
      const res = await api.put(`/alerts/${alertId}/read`);
      if (res.data.success) {
        setToastMessage(`Alert ${alertId} transitioned to READ state.`);
        setTimeout(() => setToastMessage(null), 3000);
        await fetchAlerts();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark read');
    }
  };

  const handleDismiss = async (alertId) => {
    try {
      const res = await api.put(`/alerts/${alertId}/dismiss`);
      if (res.data.success) {
        setToastMessage(`Alert ${alertId} transitioned to DISMISSED state.`);
        setTimeout(() => setToastMessage(null), 3000);
        await fetchAlerts();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to dismiss');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title & State Machine Header */}
      <div className="pb-2 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Bell className="w-6 h-6 text-amber-400" />
            <span>Alert Lifecycle State Machine (FR-07)</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Transitions: Generated &rarr; Unread &rarr; markRead() &rarr; dismiss() (Slide 19)
          </p>
        </div>

        {/* State Machine Flow Visualizer */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center space-x-2 text-[10px] font-mono text-slate-400">
          <GitCommit className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Generated</span>
          <span>&rarr;</span>
          <span className="text-rose-400 font-bold">Unread</span>
          <span>&rarr;</span>
          <span className="text-cyan-400 font-bold">Read</span>
          <span>&rarr;</span>
          <span className="text-slate-400">Dismissed</span>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-700 text-emerald-300 rounded-xl text-xs flex items-center space-x-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-950/70 border border-rose-700 text-rose-300 rounded-xl text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Tally Bar */}
      <div className="soc-glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-mono">Status:</span>
          {['ALL', 'UNREAD', 'READ', 'DISMISSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition ${
                statusFilter === st
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-mono">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">ALL SEVERITIES</option>
            <option value="CRITICAL">CRITICAL ONLY</option>
            <option value="HIGH">HIGH ONLY</option>
            <option value="MEDIUM">MEDIUM ONLY</option>
          </select>

          <button
            onClick={fetchAlerts}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="text-center py-12 space-y-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Refreshing alerts queue from database...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="soc-glass-card rounded-2xl p-12 text-center">
          <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">No alerts match current criteria</h3>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            All security incidents in this category have been triaged or dismissed.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const isUnread = alert.status === 'UNREAD';
            const isRead = alert.status === 'READ';
            const isDismissed = alert.status === 'DISMISSED';
            const isCrit = alert.severity === 'CRITICAL';
            const isHigh = alert.severity === 'HIGH';

            return (
              <div
                key={alert.alertId}
                className={`soc-glass-card rounded-xl p-4 transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isUnread ? 'border-amber-500/40 bg-slate-900/50' : 'opacity-70'
                }`}
              >
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="font-mono font-bold text-xs text-white">{alert.alertId}</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border uppercase ${
                        isCrit
                          ? 'bg-rose-950/80 text-rose-400 border-rose-700'
                          : isHigh
                          ? 'bg-amber-950/80 text-amber-400 border-amber-700'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                        isUnread
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : isRead
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      STATUS: {alert.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      SOURCE: {alert.sourceType}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-200">{alert.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{alert.description}</p>

                  <div className="flex items-center flex-wrap gap-3 text-[11px] text-slate-500 font-mono pt-1">
                    <span>Source Ref: {alert.sourceRef}</span>
                    {alert.mitreTactic && <span>• Tactic: {alert.mitreTactic}</span>}
                    {alert.mitreTechnique && <span>• Technique: {alert.mitreTechnique}</span>}
                    <span>• {new Date(alert.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* State Machine Transition Buttons */}
                <div className="flex items-center space-x-2 self-end md:self-center flex-shrink-0">
                  {isUnread && (
                    <button
                      onClick={() => handleMarkRead(alert.alertId)}
                      className="px-3 py-1.5 bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700/60 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>markRead()</span>
                    </button>
                  )}

                  {!isDismissed && (
                    <button
                      onClick={() => handleDismiss(alert.alertId)}
                      className="px-3 py-1.5 bg-rose-950/70 hover:bg-rose-900/80 text-rose-300 border border-rose-700/60 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>dismiss()</span>
                    </button>
                  )}

                  {isDismissed && (
                    <span className="text-[11px] font-mono text-slate-600 px-2 py-1">Archived</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertsView;
