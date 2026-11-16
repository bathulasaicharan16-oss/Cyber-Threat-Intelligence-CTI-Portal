import React, { useState } from 'react';
import { Shield, ShieldAlert, Key, User, Lock, ArrowRight, CheckCircle2, AlertTriangle, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  {
    role: 'SECURITY_ANALYST',
    title: 'Security Analyst',
    email: 'a.rao@soc.org',
    desc: 'Investigate CVEs, query IOC reputation & submit malware hashes',
    badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/40',
  },
  {
    role: 'SOC_TEAM',
    title: 'SOC Team Lead',
    email: 'soc.lead@soc.org',
    desc: 'Monitor real-time threat dashboard, triage & dismiss alerts',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/40',
  },
  {
    role: 'TI_RESEARCHER',
    title: 'TI Researcher',
    email: 'researcher@soc.org',
    desc: 'Map MITRE ATT&CK techniques & generate/export PDF reports',
    badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-950/40',
  },
];

const LoginView = () => {
  const { login, switchDemoRole, sessionState, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError(null);
    const result = await login(email, password);
    if (!result.success) {
      setLocalError(result.error);
    }
    setSubmitting(false);
  };

  const handleQuickDemo = async (role) => {
    setSubmitting(true);
    setLocalError(null);
    await switchDemoRole(role);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background SOC grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Academic Header Banner */}
      <div className="text-center max-w-2xl mb-8 relative z-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-700/40 text-cyan-400 text-xs font-mono mb-4">
          <GraduationCap className="w-4 h-4" />
          <span>Amity University Rajasthan • BCS 502 Project</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Cyber Threat Intelligence Portal
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Unified SOC Platform for CVEs, IOC Reputation, Malware Analysis, and MITRE ATT&CK Mapping
        </p>
        <div className="text-xs text-slate-500 mt-1">
          B. Sai Charan (A20405224070) &amp; D. Ganesh Ravichandu (A20405224296) • Guided by Dr. Deepti Saxena
        </div>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* 1-Click Demo Login Panel (Left) */}
        <div className="lg:col-span-7 bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  1-Click Viva Demo Role Switcher
                </h2>
              </div>
              <span className="text-[11px] font-mono text-cyan-400">Pass: Password@123</span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Select one of the pre-seeded UML Object Diagram accounts to test Role-Based Access Control (RBAC):
            </p>

            <div className="space-y-3">
              {DEMO_ACCOUNTS.map((acc) => (
                <div
                  key={acc.role}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition flex items-center justify-between group"
                >
                  <div className="pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">{acc.title}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-mono rounded border font-semibold ${acc.badgeColor}`}>
                        {acc.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-cyan-300 font-mono mt-0.5">{acc.email}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{acc.desc}</p>
                  </div>
                  <button
                    onClick={() => handleQuickDemo(acc.role)}
                    disabled={submitting}
                    className="px-3 py-2 bg-slate-800 hover:bg-cyan-600 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition shadow-md whitespace-nowrap group-hover:bg-cyan-600"
                  >
                    <span>Login</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Session State Machine Badge */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono">Session State Machine:</span>
            <div className="flex items-center space-x-2 font-mono">
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                sessionState === 'Authenticated'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : sessionState === 'Authenticating'
                  ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {sessionState}
              </span>
            </div>
          </div>
        </div>

        {/* Custom Login Form (Right) */}
        <div className="lg:col-span-5 bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-center">
          <div className="flex items-center space-x-2 mb-4">
            <Lock className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Analyst Login</h2>
          </div>

          {(error || localError) && (
            <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error || localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@soc.org"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/40 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 text-[11px] text-slate-500 text-center">
            Zero-config academic demonstration environment. Passwords hashed with bcrypt.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
