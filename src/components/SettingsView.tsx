import React, { useState } from 'react';
import {
  Settings,
  HardDrive,
  Trash2,
  Sparkles,
  Keyboard,
  Shield,
  WifiOff,
  CheckCircle2,
  Sun,
  Moon,
} from 'lucide-react';

interface SettingsViewProps {
  onLoadSampleText: () => void;
  onLoadSampleCSV: () => void;
  onClearWorkspace: () => void;
  currentTheme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onLoadSampleText,
  onLoadSampleCSV,
  onClearWorkspace,
  currentTheme = 'light',
  onToggleTheme,
}) => {
  // Feature I: Optional local session storage (DEFAULT OFF)
  const [localPersistenceEnabled, setLocalPersistenceEnabled] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const togglePersistence = () => {
    if (!localPersistenceEnabled) {
      const confirm = window.confirm(
        'OPTIONAL LOCAL STORAGE:\nEnabling local session management will store sanitized document snapshots on this device using IndexedDB/localStorage.\n\nRaw sensitive documents should not be stored permanently on shared devices.\n\nProceed to enable?'
      );
      if (confirm) {
        setLocalPersistenceEnabled(true);
        localStorage.setItem('veil_local_persistence', 'true');
      }
    } else {
      setLocalPersistenceEnabled(false);
      localStorage.removeItem('veil_local_persistence');
      localStorage.removeItem('veil_saved_sessions');
      setSessionCount(0);
    }
  };

  const handlePurgeStorage = () => {
    localStorage.removeItem('veil_saved_sessions');
    setSessionCount(0);
    alert('All local snapshots have been purged from this device.');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-foreground select-none">
      {/* Title */}
      <div>
        <h2 className="text-base font-semibold tracking-tight text-foreground flex items-center space-x-2">
          <Settings className="w-4 h-4 text-foreground-muted" />
          <span>Application Settings & Device Security</span>
        </h2>
        <p className="text-xs text-foreground-muted mt-0.5">
          Manage local device persistence, offline caching, and workspace preferences.
        </p>
      </div>

      {/* Visual Theme Appearance */}
      <div className="p-4 rounded-lg bg-surface-2 border border-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            {currentTheme === 'dark' ? (
              <Moon className="w-4 h-4 text-blue-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <div>
              <div className="text-xs font-semibold text-foreground font-mono">
                Theme Appearance
              </div>
              <div className="text-[11px] text-foreground-muted">
                Switch between Light (Paper Archival) and Dark (Cyber Security) modes.
              </div>
            </div>
          </div>

          <button
            onClick={onToggleTheme}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface-1 text-xs font-mono font-semibold text-foreground hover:border-accent transition-colors cursor-pointer"
          >
            {currentTheme === 'dark' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span>DARK MODE (ACTIVE)</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>LIGHT MODE (ACTIVE)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feature I: Local Session Management */}
      <div className="p-4 rounded-lg bg-surface-2 border border-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <HardDrive className="w-4 h-4 text-accent" />
            <div>
              <div className="text-xs font-semibold text-foreground font-mono">
                Local Device Session Storage (Feature I)
              </div>
              <div className="text-[11px] text-foreground-muted">
                Default: OFF. Persists session state strictly inside this device's browser sandbox.
              </div>
            </div>
          </div>

          <button
            onClick={togglePersistence}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors border ${
              localPersistenceEnabled
                ? 'bg-accent-dim text-accent border-accent-border'
                : 'bg-surface-3 text-foreground-muted border-border hover:text-foreground'
            }`}
          >
            {localPersistenceEnabled ? 'ENABLED' : 'DISABLED (RECOMMENDED)'}
          </button>
        </div>

        {localPersistenceEnabled && (
          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs font-mono">
            <span className="text-foreground-dim">
              Stored local sessions: {sessionCount}
            </span>
            <button
              onClick={handlePurgeStorage}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-danger-dim text-danger border border-danger-border hover:brightness-110"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Device Storage</span>
            </button>
          </div>
        )}
      </div>

      {/* Feature H: Safe Demo Mode */}
      <div className="p-4 rounded-lg bg-surface-2 border border-border space-y-3">
        <div className="flex items-center space-x-2.5">
          <Sparkles className="w-4 h-4 text-warning" />
          <div>
            <div className="text-xs font-semibold text-foreground font-mono">
              Safe Demo Mode (Feature H)
            </div>
            <div className="text-[11px] text-foreground-muted">
              Pre-configured fictional data sets for hackathon demonstrations and live evaluations.
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-1">
          <button
            onClick={onLoadSampleText}
            className="px-3 py-1.5 rounded bg-surface-3 border border-border text-xs font-mono text-accent hover:border-accent transition-colors"
          >
            Load Support Ticket Demo
          </button>
          <button
            onClick={onLoadSampleCSV}
            className="px-3 py-1.5 rounded bg-surface-3 border border-border text-xs font-mono text-[#56D4DD] hover:border-[#56D4DD] transition-colors"
          >
            Load Multi-Column CSV Demo
          </button>
        </div>
      </div>

      {/* Feature J: Offline Architecture */}
      <div className="p-4 rounded-lg bg-surface-2 border border-border space-y-2">
        <div className="flex items-center space-x-2.5">
          <WifiOff className="w-4 h-4 text-blue" />
          <div className="text-xs font-semibold text-foreground font-mono">
            Air-Gapped & Offline Ready (Feature J)
          </div>
        </div>
        <p className="text-xs text-foreground-muted leading-relaxed">
          ZERO TRACE utilizes client-side bundle compilation and Service Worker caching. Once loaded, you can disconnect your computer from the network and execute all detection, sanitization, and export workflows completely offline.
        </p>
        <div className="flex items-center space-x-1.5 text-accent text-xs font-mono pt-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Operational offline without network dependencies.</span>
        </div>
      </div>

      {/* Keyboard Shortcuts Reference */}
      <div className="p-4 rounded-lg bg-surface-2 border border-border space-y-3">
        <div className="flex items-center space-x-2.5">
          <Keyboard className="w-4 h-4 text-foreground-muted" />
          <div className="text-xs font-semibold text-foreground font-mono">
            Keyboard Shortcuts
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="flex items-center justify-between p-2 rounded bg-surface-1 border border-border">
            <span className="text-foreground-muted">Copy Sanitized Output</span>
            <kbd className="px-2 py-0.5 rounded bg-surface-3 border border-border text-foreground">
              Ctrl/Cmd + Shift + C
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-surface-1 border border-border">
            <span className="text-foreground-muted">Open File Picker</span>
            <kbd className="px-2 py-0.5 rounded bg-surface-3 border border-border text-foreground">
              Ctrl/Cmd + O
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-surface-1 border border-border">
            <span className="text-foreground-muted">Close Inspector / Modal</span>
            <kbd className="px-2 py-0.5 rounded bg-surface-3 border border-border text-foreground">
              Escape
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-surface-1 border border-border">
            <span className="text-foreground-muted">Clear Workspace</span>
            <kbd className="px-2 py-0.5 rounded bg-surface-3 border border-border text-foreground">
              Ctrl/Cmd + Shift + X
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
