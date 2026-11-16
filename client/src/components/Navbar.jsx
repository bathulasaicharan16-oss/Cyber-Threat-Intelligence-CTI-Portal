import React, { useState } from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  Search,
  Crosshair,
  Bug,
  Grid,
  Bell,
  FileText,
  UserCheck,
  ChevronDown,
  LogOut,
  Info,
  Network,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'cve', label: 'CVE Search', icon: Search },
  { id: 'ioc', label: 'IOC Lookup', icon: Crosshair },
  { id: 'malware', label: 'Malware', icon: Bug },
  { id: 'mitre', label: 'MITRE Matrix', icon: Grid },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'reports', label: 'Reports', icon: FileText },
];

const ROLES = [
  { id: 'SECURITY_ANALYST', label: 'Security Analyst', email: 'a.rao@soc.org', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  { id: 'SOC_TEAM', label: 'SOC Team Lead', email: 'soc.lead@soc.org', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { id: 'TI_RESEARCHER', label: 'TI Researcher', email: 'researcher@soc.org', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
];

const Navbar = ({ activeTab, setActiveTab, onOpenAbout, onOpenUml, unreadAlertCount = 0 }) => {
  const { user, logout, switchDemoRole } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const currentRoleConfig = ROLES.find((r) => r.id === user?.role) || ROLES[0];

  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-900/40">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-white text-base md:text-lg tracking-tight">CTI Portal</span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-semibold">
                  BCS 502
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Software Engineering Project • Amity University
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition relative ${
                    isActive
                      ? 'bg-slate-800/90 text-cyan-400 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.id === 'alerts' && unreadAlertCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 text-[9px] font-mono font-bold bg-rose-500 text-white rounded-full">
                      {unreadAlertCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: UML, About, Demo Role Switcher & User */}
          <div className="flex items-center space-x-2">
            {/* UML Modal Trigger */}
            <button
              onClick={onOpenUml}
              title="View 8 UML Diagrams (Slides 13–20)"
              className="p-1.5 md:px-2.5 md:py-1.5 text-xs text-indigo-300 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-700/50 rounded-lg flex items-center space-x-1.5 transition"
            >
              <Network className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline font-mono text-[11px]">UML Specs</span>
            </button>

            {/* About Modal Trigger */}
            <button
              onClick={onOpenAbout}
              title="Project Details & Authors"
              className="p-1.5 md:px-2.5 md:py-1.5 text-xs text-slate-300 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-lg flex items-center space-x-1.5 transition"
            >
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline font-mono text-[11px]">BCS 502</span>
            </button>

            {/* 1-Click Demo Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition ${currentRoleConfig.color}`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-bold">{user?.role?.replace('_', ' ')}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Demo Role Switcher (RBAC)
                    </p>
                    <p className="text-[10px] text-slate-500">1-click test between the 3 actors</p>
                  </div>
                  {ROLES.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => {
                        switchDemoRole(role.id);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex flex-col mb-1 ${
                        user?.role === role.id
                          ? 'bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/30'
                          : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <span className="font-bold">{role.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{role.email}</span>
                    </button>
                  ))}
                  <div className="border-t border-slate-800 mt-1 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setRoleMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-950/40 flex items-center space-x-1.5"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Log Out Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Subnav */}
        <div className="flex lg:hidden overflow-x-auto space-x-1 py-2 border-t border-slate-800/60 scrollbar-thin">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 font-semibold'
                    : 'text-slate-400'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
