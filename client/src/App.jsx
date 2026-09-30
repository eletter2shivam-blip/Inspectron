import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

import Dashboard from './pages/Dashboard';
import PretureDashboard from './pages/PretureDashboard';
import RequirementsAnalyzer from './pages/RequirementsAnalyzer';
import JiraIntegration from './pages/JiraIntegration';
import TestCaseGenerator from './pages/TestCaseGenerator';
import RegressionGenerator from './pages/RegressionGenerator';
import ApiTestGenerator from './pages/ApiTestGenerator';
import EdgeCaseAnalyzer from './pages/EdgeCaseAnalyzer';
import TestDataGenerator from './pages/TestDataGenerator';
import BugAnalyzer from './pages/BugAnalyzer';
import TestCoverage from './pages/TestCoverage';
import TestCaseRepository from './pages/TestCaseRepository';
import Projects from './pages/Projects';
import AiHistory from './pages/AiHistory';
import Settings from './pages/Settings';
import Login from './pages/Login';

function MainApp() {
  const { isAuthenticated, loading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  // Inter-page workflow states
  const [generatorRequirement, setGeneratorRequirement] = useState('');
  const [generatorTitle, setGeneratorTitle] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Initializing AI QA Assistant Platform...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setActiveSection('dashboard')} />;
  }

  const navigateToGeneratorWithReq = (reqText, reqTitle) => {
    setGeneratorRequirement(reqText);
    setGeneratorTitle(reqTitle);
    setActiveSection('generator');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Sidebar navigation */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={(sec) => setActiveSection(sec)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto bg-slate-950/40">
          {activeSection === 'dashboard' && (
            <Dashboard onNavigate={(sec) => setActiveSection(sec)} />
          )}

          {activeSection === 'preture' && (
            <PretureDashboard />
          )}

          {activeSection === 'requirements' && (
            <RequirementsAnalyzer
              onNavigateToGenerator={navigateToGeneratorWithReq}
            />
          )}

          {activeSection === 'jira' && (
            <JiraIntegration
              onNavigateToRepository={() => setActiveSection('repository')}
            />
          )}

          {activeSection === 'generator' && (
            <TestCaseGenerator
              initialRequirement={generatorRequirement}
              initialTitle={generatorTitle}
              onNavigateToRepository={() => setActiveSection('repository')}
            />
          )}

          {activeSection === 'regression' && (
            <RegressionGenerator />
          )}

          {activeSection === 'api-tests' && (
            <ApiTestGenerator />
          )}

          {activeSection === 'edge-cases' && (
            <EdgeCaseAnalyzer />
          )}

          {activeSection === 'test-data' && (
            <TestDataGenerator />
          )}

          {activeSection === 'bugs' && (
            <BugAnalyzer
              onNavigateToRegression={() => setActiveSection('regression')}
            />
          )}

          {activeSection === 'coverage' && (
            <TestCoverage
              onNavigateToGenerator={navigateToGeneratorWithReq}
            />
          )}

          {activeSection === 'repository' && (
            <TestCaseRepository />
          )}

          {activeSection === 'projects' && (
            <Projects />
          )}

          {activeSection === 'history' && (
            <AiHistory />
          )}

          {activeSection === 'settings' && (
            <Settings />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ProjectProvider>
          <MainApp />
        </ProjectProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
