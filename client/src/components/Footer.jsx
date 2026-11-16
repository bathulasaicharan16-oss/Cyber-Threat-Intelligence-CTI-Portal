import React from 'react';
import { ShieldCheck, GraduationCap, Heart } from 'lucide-react';

const Footer = ({ onOpenAbout, onOpenUml }) => {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-[#090d16] py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Academic Details */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold">
            <GraduationCap className="w-4 h-4" />
            <span>Amity University Rajasthan</span>
          </div>
          <span className="hidden sm:inline text-slate-600">•</span>
          <p className="text-slate-400">
            BCS 502 Software Engineering Project | <span className="text-slate-300 font-medium">B.Tech CSE (5th Sem, Sec A)</span>
          </p>
        </div>

        {/* Authors & Guide */}
        <div className="text-center md:text-right">
          <p className="text-slate-300 font-medium">
            Submitted by: <span className="text-cyan-400 font-semibold">B. Sai Charan</span> (A20405224070) &amp;{' '}
            <span className="text-cyan-400 font-semibold">D. Ganesh Ravichandu</span> (A20405224296)
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Under the guidance of <span className="text-indigo-400 font-medium">Dr. Deepti Saxena</span> • Academic Year 2026–2027
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center space-x-3">
          <button onClick={onOpenAbout} className="hover:text-cyan-400 transition">About Project</button>
          <span>•</span>
          <button onClick={onOpenUml} className="hover:text-cyan-400 transition">8 UML Diagrams</button>
          <span>•</span>
          <span className="font-mono text-slate-400">REST API v1.0 • Node.js + Express + React</span>
        </div>
        <div className="flex items-center space-x-1.5 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>SOC Ready Prototype • Zero-Config In-Memory DB Mode Active</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
