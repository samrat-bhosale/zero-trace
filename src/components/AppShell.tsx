import React, { useState, useEffect } from 'react';
import { useSanitizer } from '../hooks/useSanitizer';
import { Sidebar } from './Sidebar';
import { HeroSection } from './HeroSection';
import { DetectionOverview } from './DetectionOverview';
import { ComparisonToolbar } from './ComparisonToolbar';
import { OriginalDocumentPanel } from './OriginalDocumentPanel';
import { SanitizedOutputPanel } from './SanitizedOutputPanel';
import { RedactionSettingsCard } from './RedactionSettingsCard';
import { BottomCards } from './BottomCards';
import { DiffViewer } from './DiffViewer';
import { PrivacyModal } from './PrivacyModal';
import { RiskDetailsModal } from './RiskDetailsModal';
import { SettingsView } from './SettingsView';
import { ProcessingLog } from './ProcessingLog';
import { RedactionControls } from './RedactionControls';
import { IntroPage } from './IntroPage';
import { EmptyState } from './EmptyState';
import { WorkflowStepper } from './WorkflowStepper';
import { Shield, Sun, Moon } from 'lucide-react';

export const AppShell: React.FC = () => {
  const {
    originalText,
    setOriginalText,
    sanitizedText,
    entities,
    globalRedactionMode,
    setGlobalRedactionMode,
    enabledTypes,
    setEnabledTypes,
    preset,
    applyPreset,
    diffResult,
    riskAssessment,
    auditLogs,
    addLog,
    loadSample,
    handleFileUpload,
    isProcessing,
    clearWorkspace,
    exportSanitizedFile,
    exportAuditReport,
    exportMappingTable,
    redactionResult,
    customRules,
    setCustomRules,
  } = useSanitizer();

  const [currentTab, setCurrentTab] = useState<'workspace' | 'rules' | 'audit' | 'settings'>('workspace');
  const [activeView, setActiveView] = useState<'side-by-side' | 'diff' | 'preview'>('side-by-side');
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [hasExported, setHasExported] = useState(false);
  const [notice, setNotice] = useState('');
  const hasDocument = originalText.trim().length > 0;

  const announce = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2400);
  };

  const handleSanitizedDownload = () => {
    exportSanitizedFile();
    setHasExported(true);
    announce('Sanitized copy downloaded');
  };

  const handleCopyOutput = async () => {
    try {
      await navigator.clipboard.writeText(sanitizedText);
      announce('Sanitized output copied');
    } catch {
      announce('Could not access the clipboard');
    }
  };

  useEffect(() => {
    setHasExported(false);
  }, [originalText, globalRedactionMode, enabledTypes, preset, customRules]);

  // Theme Management (Light / Dark)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('zero_trace_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('zero_trace_theme', theme);
    } catch {
      // Safe fallback
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPrivacyModalOpen(false);
        setIsRiskModalOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        if (sanitizedText) {
          navigator.clipboard.writeText(sanitizedText);
          addLog('Copied sanitized output to clipboard via keyboard shortcut', 'info');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sanitizedText, addLog]);

  if (showIntro) {
    return <IntroPage onEnter={() => setShowIntro(false)} />;
  }

  return (
    <div className="page-enter min-h-screen w-screen bg-[#EDEDE9] dark:bg-[#292521] text-[#3D3732] dark:text-[#F5EBE0] flex font-sans overflow-x-hidden antialiased transition-colors duration-300">
      {/* A. Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onNewSession={clearWorkspace}
        onLoadSampleData={() => loadSample('text')}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col p-4 md:p-7 overflow-y-auto max-h-screen space-y-4">
        {/* Top Floating Utility Bar (Privacy Shield Active & Sun icon) */}
        <div className="flex items-center justify-end space-x-2 select-none">
          <button
            onClick={() => setIsPrivacyModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#5D4C3E] text-white text-xs font-semibold shadow-xs hover:bg-[#493B31] transition-all"
          >
            <Shield className="w-3.5 h-3.5 text-[#D5BDAF] fill-current" />
            <span>Privacy Shield Active</span>
          </button>

          <button
            onClick={toggleTheme}
            className="w-7 h-7 rounded-full bg-white dark:bg-[#494138] border border-[#D6CCC2] dark:border-[#5B5046] shadow-xs flex items-center justify-center text-[#766C63] dark:text-[#E2E8F0] hover:text-[#3D3732] dark:hover:text-white hover:bg-[#F5EBE0] dark:hover:bg-[#5B5046] transition-all cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? (
              <Moon className="w-3.5 h-3.5 text-[#D5BDAF]" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-[#F59E0B]" />
            )}
          </button>
        </div>

        {/* Tab Routing */}
        {currentTab === 'rules' ? (
          <div className="bg-white rounded-2xl border border-[#D6CCC2] p-6 shadow-card">
            <RedactionControls
              globalMode={globalRedactionMode}
              setGlobalMode={setGlobalRedactionMode}
              preset={preset}
              applyPreset={applyPreset}
              enabledTypes={enabledTypes}
              setEnabledTypes={setEnabledTypes}
              customRules={customRules}
              setCustomRules={setCustomRules}
              entities={entities}
            />
          </div>
        ) : currentTab === 'audit' ? (
          <div className="bg-white rounded-2xl border border-[#D6CCC2] p-6 shadow-card">
            <ProcessingLog
              logs={auditLogs}
              onClearLogs={() => addLog('Audit log cleared by user', 'info')}
              onExportAudit={exportAuditReport}
            />
          </div>
        ) : currentTab === 'settings' ? (
          <div className="bg-white rounded-2xl border border-[#D6CCC2] p-6 shadow-card">
            <SettingsView
              onLoadSampleText={() => {
                loadSample('text');
                setCurrentTab('workspace');
              }}
              onLoadSampleCSV={() => {
                loadSample('csv');
                setCurrentTab('workspace');
              }}
              onClearWorkspace={clearWorkspace}
              currentTheme={theme}
              onToggleTheme={toggleTheme}
            />
          </div>
        ) : (
          /* Sanitization Workspace */
          <div className="space-y-4">
            {/* B & C. Top Hero Section and Detection Overview */}
            <div className="space-y-3">
              <HeroSection
                onStartNow={() => {
                  const el = document.getElementById('document-workspace');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                onLearnMore={() => setIsPrivacyModalOpen(true)}
              />

              <DetectionOverview
                entities={entities}
                riskLevel={riskAssessment.level}
                onOpenRiskModal={() => setIsRiskModalOpen(true)}
              />
            </div>

            <WorkflowStepper hasDocument={hasDocument} hasExported={hasExported} />

            {/* D. Comparison Toolbar */}
            {hasDocument && (
              <ComparisonToolbar
                activeView={activeView}
                setActiveView={setActiveView}
              />
            )}

            {/* E, F, G. Document Workspace Panels */}
            <div id="document-workspace" className="scroll-mt-4">
              {!hasDocument ? (
                <EmptyState
                  onLoadSampleText={() => loadSample('text')}
                  onLoadSampleCSV={() => loadSample('csv')}
                  onFileUpload={handleFileUpload}
                  onPasteText={setOriginalText}
                  isProcessing={isProcessing}
                />
              ) : activeView === 'diff' ? (
                <div className="bg-white border border-[#D6CCC2] rounded-2xl p-4 shadow-card min-h-[330px]">
                  <DiffViewer
                    diffResult={diffResult}
                    comparisonMode="side-by-side"
                    showOnlyChanges={false}
                  />
                </div>
              ) : activeView === 'preview' ? (
                <div className="bg-white border border-[#D6CCC2] rounded-2xl shadow-card overflow-hidden">
                  <SanitizedOutputPanel
                    sanitizedText={sanitizedText}
                    redactionResult={redactionResult}
                    onDownload={handleSanitizedDownload}
                  />
                </div>
              ) : (
                /* Side-by-Side: Original Document, Center Arrow, Sanitized Output, Redaction Settings */
                <div className="space-y-4">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
                  <OriginalDocumentPanel
                    text={originalText}
                    onChangeText={setOriginalText}
                    entities={entities}
                  />
                  <SanitizedOutputPanel
                    sanitizedText={sanitizedText}
                    redactionResult={redactionResult}
                    onDownload={handleSanitizedDownload}
                  />
                </div>
                <div className="mt-4">
                  <RedactionSettingsCard
                    globalMode={globalRedactionMode}
                    setGlobalMode={setGlobalRedactionMode}
                    enabledTypes={enabledTypes}
                    onToggleType={(type) => {
                      setEnabledTypes((prev) => ({
                        ...prev,
                        [type]: !prev[type],
                      }));
                    }}
                    preset="balanced"
                    onChangePreset={applyPreset}
                    onApplyRules={() => {
                      addLog('Redaction rules applied to sanitized output', 'success');
                    }}
                  />
                </div>
                </div>
              )}
            </div>

            {/* H, I, J, K. Bottom Row: 4 Cards */}
            {hasDocument && (
              <BottomCards
                riskScore={riskAssessment.score}
                riskLevel={riskAssessment.level}
                riskFactors={riskAssessment.reasons}
                auditLogs={auditLogs}
                onOpenRiskModal={() => setIsRiskModalOpen(true)}
                onDownloadSanitized={handleSanitizedDownload}
                onCopyOutput={handleCopyOutput}
                onExportReport={() => { exportAuditReport(); announce('Audit report exported'); }}
                onDownloadMapping={() => { exportMappingTable(); announce('Mapping file downloaded'); }}
              />
            )}
          </div>
        )}
      </div>

      {notice && (
        <div role="status" aria-live="polite" className="fixed bottom-5 right-5 z-40 rounded-xl border border-[#D6CCC2] bg-white px-4 py-3 text-xs font-semibold text-[#746250] shadow-lg dark:border-[#225346] dark:bg-[#37312C] dark:text-[#67C4A8] animate-in fade-in slide-in-from-bottom-2 duration-200">
          {notice}
        </div>
      )}

      {/* Modals */}
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      <RiskDetailsModal
        isOpen={isRiskModalOpen}
        onClose={() => setIsRiskModalOpen(false)}
        assessment={riskAssessment}
      />
    </div>
  );
};
