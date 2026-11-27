import React from 'react';
import {
  Shield,
  Layers,
  Settings,
  PlusSquare,
  RotateCcw,
  Play,
  Lock,
} from 'lucide-react';

interface SidebarProps {
  currentTab: 'workspace' | 'rules' | 'audit' | 'settings';
  setCurrentTab: (tab: 'workspace' | 'rules' | 'audit' | 'settings') => void;
  onNewSession: () => void;
  onLoadSampleData: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onNewSession,
  onLoadSampleData,
}) => {
  return (
    <aside className="w-[64px] sm:w-[205px] bg-white border-r border-[#D6CCC2] flex flex-col justify-between shrink-0 select-none py-4 px-2 sm:px-3 h-screen">
      {/* Top Header & Navigation */}
      <div>
        {/* Brand */}
        <div className="flex items-center justify-center sm:justify-start space-x-2.5 px-0 sm:px-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#746250] flex items-center justify-center text-white shadow-sm shadow-[#746250]/30 shrink-0">
            <Shield className="w-4 h-4 fill-white text-[#746250]" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold text-[#3D3732] leading-tight tracking-tight uppercase">
              ZERO TRACE
            </div>
            <div className="text-[9px] text-[#766C63] font-semibold tracking-wider uppercase mt-0.5">
              PRIVACY INTELLIGENCE
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          <button
            onClick={() => setCurrentTab('workspace')}
              title="Sanitization Workspace"
              className={`w-full flex items-center justify-center sm:justify-start space-x-2.5 px-2 sm:px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'workspace'
                ? 'bg-[#E3D5CA] text-[#746250] shadow-xs'
                : 'text-[#766C63] hover:text-[#3D3732] hover:bg-[#EDEDE9]'
            }`}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="hidden sm:inline">Sanitization Workspace</span>
          </button>

          <button
            onClick={() => setCurrentTab('rules')}
              title="Detection Rules"
              className={`w-full flex items-center justify-center sm:justify-start space-x-2.5 px-2 sm:px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              currentTab === 'rules'
                ? 'bg-[#E3D5CA] text-[#746250] font-semibold'
                : 'text-[#766C63] hover:text-[#3D3732] hover:bg-[#EDEDE9]'
            }`}
          >
            <PlusSquare className="w-4 h-4 text-[#766C63]" />
            <span className="hidden sm:inline">Detection Rules</span>
          </button>

          <button
            onClick={() => setCurrentTab('audit')}
              title="Audit History"
              className={`w-full flex items-center justify-center sm:justify-start space-x-2.5 px-2 sm:px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              currentTab === 'audit'
                ? 'bg-[#E3D5CA] text-[#746250] font-semibold'
                : 'text-[#766C63] hover:text-[#3D3732] hover:bg-[#EDEDE9]'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-[#766C63]" />
            <span className="hidden sm:inline">Audit History</span>
          </button>

          <button
            onClick={() => setCurrentTab('settings')}
              title="Settings"
              className={`w-full flex items-center justify-center sm:justify-start space-x-2.5 px-2 sm:px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              currentTab === 'settings'
                ? 'bg-[#E3D5CA] text-[#746250] font-semibold'
                : 'text-[#766C63] hover:text-[#3D3732] hover:bg-[#EDEDE9]'
            }`}
          >
            <Settings className="w-4 h-4 text-[#766C63]" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t border-[#D6CCC2]">
          <div className="hidden sm:block text-[11px] font-medium text-[#8D8177] px-2 mb-2">
            Quick Actions
          </div>

          <div className="space-y-1.5">
            <button
              onClick={onNewSession}
              title="New Session"
              className="w-full flex items-center justify-center sm:justify-start space-x-2 px-2 sm:px-3 py-2 rounded-xl border border-[#D6CCC2] bg-white text-xs font-medium text-[#55483F] hover:border-[#746250]/40 hover:bg-[#F5EBE0] transition-all shadow-xs"
            >
              <div className="w-3.5 h-3.5 rounded-full bg-[#E3D5CA] flex items-center justify-center text-[#746250]">
                <Play className="w-2 h-2 fill-current" />
              </div>
              <span className="hidden sm:inline">New Session</span>
            </button>

            <button
              onClick={onLoadSampleData}
              title="Load Sample Data"
              className="w-full flex items-center justify-center sm:justify-start space-x-2 px-2 sm:px-3 py-2 rounded-xl border border-[#D6CCC2] bg-white text-xs font-medium text-[#55483F] hover:border-[#746250]/40 hover:bg-[#F5EBE0] transition-all shadow-xs"
            >
              <div className="w-3.5 h-3.5 rounded-full bg-[#E3D5CA] flex items-center justify-center text-[#746250]">
                <Layers className="w-2.2 h-2.2" />
              </div>
              <span className="hidden sm:inline">Load Sample Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Privacy Card & Version */}
      <div>
        <div className="hidden sm:block p-3 rounded-2xl bg-[#F5EBE0] border border-[#D6CCC2] text-center space-y-1.5">
          <div className="w-7 h-7 mx-auto rounded-lg bg-[#746250] flex items-center justify-center text-white shadow-xs">
            <Shield className="w-4 h-4 fill-white text-[#746250]" />
          </div>
          <div className="text-xs font-bold text-[#3D3732] leading-tight">
            Local Processing<br />Active
          </div>
          <div className="text-[10px] text-[#766C63] leading-tight">
            Your data never leaves your browser.
          </div>
        </div>

        <div className="hidden sm:block text-[11px] text-[#9E9288] text-center mt-3 font-mono">
          v1.0.0
        </div>
      </div>
    </aside>
  );
};
