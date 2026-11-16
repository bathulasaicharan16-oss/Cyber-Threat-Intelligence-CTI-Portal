import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AboutModal from './components/AboutModal';
import UmlDiagramsModal from './components/UmlDiagramsModal';

import LoginView from './pages/LoginView';
import DashboardView from './pages/DashboardView';
import CveSearchView from './pages/CveSearchView';
import IocInvestigationView from './pages/IocInvestigationView';
import MalwareAnalysisView from './pages/MalwareAnalysisView';
import MitreMatrixView from './pages/MitreMatrixView';
import AlertsView from './pages/AlertsView';
import ReportsView from './pages/ReportsView';

function App() {
  const { sessionState, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [aboutOpen, setAboutOpen] = useState(false);
  const [umlOpen, setUmlOpen] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(3);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-cyan-400">Initializing Cyber Threat Intelligence Portal...</p>
      </div>
    );
  }

  // User Session State Machine: Anonymous renders login
  if (sessionState === 'Anonymous') {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAbout={() => setAboutOpen(true)}
        onOpenUml={() => setUmlOpen(true)}
        unreadAlertCount={unreadAlerts}
      />

      {/* Main Content Pane */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <DashboardView onNavigateTab={setActiveTab} />}
        {activeTab === 'cve' && <CveSearchView />}
        {activeTab === 'ioc' && <IocInvestigationView />}
        {activeTab === 'malware' && <MalwareAnalysisView />}
        {activeTab === 'mitre' && <MitreMatrixView />}
        {activeTab === 'alerts' && <AlertsView onAlertCountChange={setUnreadAlerts} />}
        {activeTab === 'reports' && <ReportsView />}
      </main>

      {/* Academic Footer */}
      <Footer onOpenAbout={() => setAboutOpen(true)} onOpenUml={() => setUmlOpen(true)} />

      {/* Interactive Academic Modals */}
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
      <UmlDiagramsModal isOpen={umlOpen} onClose={() => setUmlOpen(false)} />
    </div>
  );
}

export default App;
