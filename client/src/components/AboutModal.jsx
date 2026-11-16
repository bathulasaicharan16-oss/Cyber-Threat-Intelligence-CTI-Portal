import React from 'react';
import { X, Shield, Award, Users, BookOpen, Layers, Server, Cpu } from 'lucide-react';

const AboutModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-950/50 p-6 md:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60 hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6 border-b border-slate-800 pb-4">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Cyber Threat Intelligence Portal
            </h2>
            <p className="text-xs md:text-sm text-cyan-400 font-mono">
              Software Engineering Project (BCS 502) • Unified Security Operations Platform
            </p>
          </div>
        </div>

        {/* Academic Authors & Supervisor Banner */}
        <div className="bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-xl p-5 mb-6">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm mb-3">
            <Users className="w-4 h-4" />
            <span>PROJECT CREDITS & ACADEMIC IDENTITY</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-xs mb-1">Student Investigators:</span>
              <p className="font-bold text-white text-sm">B. Sai Charan</p>
              <p className="text-cyan-400 font-mono text-xs">Enrollment: A20405224070</p>
              <p className="font-bold text-white text-sm mt-2">D. Ganesh Ravichandu</p>
              <p className="text-cyan-400 font-mono text-xs">Enrollment: A20405224296</p>
              <p className="text-slate-400 text-xs mt-2">B.Tech CSE, 5th Semester, Section A</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-xs mb-1">Faculty Supervisor:</span>
              <p className="font-bold text-white text-sm">Dr. Deepti Saxena</p>
              <span className="text-slate-400 block text-xs mt-2">Institution:</span>
              <p className="font-semibold text-slate-200">Amity University Rajasthan</p>
              <p className="text-slate-400 text-xs mt-1">Academic Year: <span className="text-cyan-400 font-mono">2026–2027</span></p>
            </div>
          </div>
        </div>

        {/* Problem Statement & Architecture */}
        <div className="space-y-4 text-xs md:text-sm text-slate-300">
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold mb-2">
              <BookOpen className="w-4 h-4" />
              <span>Problem Statement & Objective (Slides 03–07)</span>
            </div>
            <p className="leading-relaxed text-slate-300">
              SOC analysts frequently struggle with <strong>fragmented threat intelligence feeds</strong>, requiring constant tool switching between CVE databases, virus reputation sites, IP blacklists, and MITRE frameworks. This portal consolidates vulnerability tracking, indicator reputation checks, malware hashing, alert lifecycles, and PDF threat briefings into one coherent, modular web prototype.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold mb-2">
              <Layers className="w-4 h-4" />
              <span>Three-Tier Architecture & Modular Threat Adapters (Slide 12 & 20)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg">
                <span className="text-cyan-400 font-bold block mb-1">Tier 1: Client</span>
                <p className="text-slate-400">React SPA with Tailwind CSS, Lucide icons, and Recharts optimized for Chrome, Edge, and Firefox.</p>
              </div>
              <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg">
                <span className="text-cyan-400 font-bold block mb-1">Tier 2: App Server</span>
                <p className="text-slate-400">Node.js Express REST API hosting RBAC middleware, correlation engine, and PDFKit report exporter.</p>
              </div>
              <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg">
                <span className="text-cyan-400 font-bold block mb-1">Tier 3: Database</span>
                <p className="text-slate-400">MongoDB with Mongoose, backed by zero-config in-memory document persistence for live viva demos.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold mb-2">
              <Server className="w-4 h-4" />
              <span>Connected External Intelligence Adapters</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-md font-mono">NVD API 2.0 (CVEs)</span>
              <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-md font-mono">VirusTotal v3 (Malware)</span>
              <span className="px-2.5 py-1 bg-purple-950 text-purple-300 border border-purple-800 rounded-md font-mono">AlienVault OTX (Threat Pulses)</span>
              <span className="px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-800 rounded-md font-mono">AbuseIPDB (IP Confidence)</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs md:text-sm rounded-lg shadow-lg shadow-cyan-900/30 transition"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
