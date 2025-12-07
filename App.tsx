import React, { useState } from 'react';
import { DashboardView } from './components/dashboard/DashboardView';
import { AnalysisView } from './components/analysis/AnalysisView';
import { UploadView } from './components/upload/UploadView';
import { MOCK_SESSIONS } from './constants';
import { CallSession } from './types';
import { Flex } from './components/ui/Layout';
import { Activity, UploadCloud, LayoutDashboard } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'detail' | 'upload'>('dashboard');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<CallSession[]>(MOCK_SESSIONS);

  const handleSelectSession = (id: string) => {
    setSelectedSessionId(id);
    setCurrentView('detail');
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setSelectedSessionId(null);
    setCurrentView('dashboard');
  };

  const handleUpdateSession = (updatedSession: CallSession) => {
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
  };

  const handleUploadComplete = (newSession: CallSession) => {
    setSessions(prev => [newSession, ...prev]);
    setSelectedSessionId(newSession.id);
    setCurrentView('detail');
  };

  const selectedSession = sessions.find(s => s.id === selectedSessionId);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Flex align="center" gap={8}>
            <Flex align="center" gap={3} className="mr-4">
              <div className="bg-indigo-600 p-1.5 rounded-lg text-white cursor-pointer" onClick={() => setCurrentView('dashboard')}>
                <Activity size={20} />
              </div>
              <span className="font-bold text-lg tracking-tight cursor-pointer" onClick={() => setCurrentView('dashboard')}>Sales Vibe Flow</span>
            </Flex>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentView === 'dashboard' || currentView === 'detail' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </button>
              <button 
                onClick={() => setCurrentView('upload')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentView === 'upload' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                <UploadCloud size={18} />
                Uploads
              </button>
            </nav>
          </Flex>

          <div className="flex items-center gap-4">
             <div className="text-sm text-gray-500">
                Logged in as <span className="font-semibold text-gray-900">Ken</span>
             </div>
             <div className="w-8 h-8 bg-gray-200 rounded-full border border-gray-300"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        {currentView === 'dashboard' && (
          <DashboardView 
            sessions={sessions} 
            onSelectSession={handleSelectSession} 
            onUploadClick={() => setCurrentView('upload')}
          />
        )}
        
        {currentView === 'upload' && (
          <UploadView 
            onCancel={() => setCurrentView('dashboard')}
            onAnalysisComplete={handleUploadComplete}
          />
        )}

        {currentView === 'detail' && selectedSession && (
          <AnalysisView 
            session={selectedSession} 
            onBack={handleBack}
            onUpdateSession={handleUpdateSession}
          />
        )}
      </main>
    </div>
  );
}

export default App;