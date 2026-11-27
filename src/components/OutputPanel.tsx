import React, { useState } from 'react';
import {
  ShieldCheck,
  Copy,
  Check,
  Download,
  Lock,
  FileJson,
  Table,
  ChevronDown,
  Edit2,
} from 'lucide-react';
import { countWords, countLines } from '../utils/formatting';

interface OutputPanelProps {
  sanitizedText: string;
  originalText: string;
  onExportFile: () => void;
  onExportAudit: () => void;
  onExportMapping: () => void;
  manualEditEnabled: boolean;
  setManualEditEnabled: (enabled: boolean) => void;
  sanitizedOverride: string | null;
  setSanitizedOverride: (text: string) => void;
  isProcessing: boolean;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  sanitizedText,
  originalText,
  onExportFile,
  onExportAudit,
  onExportMapping,
  manualEditEnabled,
  setManualEditEnabled,
  sanitizedOverride,
  setSanitizedOverride,
  isProcessing,
}) => {
  const [copied, setCopied] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const wordCount = countWords(sanitizedText);
  const charCount = sanitizedText.length;
  const lineCount = countLines(sanitizedText);

  const handleCopy = () => {
    if (!sanitizedText) return;
    navigator.clipboard.writeText(sanitizedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-surface-1 overflow-hidden">
      {/* Top Bar */}
      <div className="h-10 border-b border-border bg-surface-2 px-3 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-semibold text-foreground">
            Sanitized Output
          </span>

          {/* Manual edit indicator */}
          <button
            onClick={() => setManualEditEnabled(!manualEditEnabled)}
            className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono border transition-colors ${
              manualEditEnabled
                ? 'bg-amber-500/10 text-warning border-amber-500/30'
                : 'text-foreground-dim border-transparent hover:text-foreground-muted'
            }`}
            title="Enable or disable manual editing of the sanitized output"
          >
            <Edit2 className="w-2.5 h-2.5" />
            <span>{manualEditEnabled ? 'Editing Enabled' : 'Protected'}</span>
          </button>
        </div>

        {/* Metadata & Actions */}
        <div className="flex items-center space-x-3 text-[11px] font-mono text-foreground-muted">
          <span>{lineCount} lines</span>
          <span>{wordCount} words</span>
          <span>{charCount} chars</span>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2 py-0.5 rounded bg-surface-3 hover:bg-surface-3/80 text-foreground transition-colors font-mono"
            title="Copy sanitized output to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-accent" />
                <span className="text-accent">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-foreground-muted" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Sanitized View */}
      <div className="flex-1 overflow-y-auto relative bg-[#0B0D0F]">
        {manualEditEnabled ? (
          <textarea
            value={sanitizedOverride !== null ? sanitizedOverride : sanitizedText}
            onChange={(e) => setSanitizedOverride(e.target.value)}
            className="w-full h-full p-4 bg-transparent font-mono text-sm leading-relaxed text-accent placeholder:text-foreground-dim focus:outline-none resize-none"
            spellCheck={false}
          />
        ) : (
          <div className="p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap select-text text-foreground">
            {sanitizedText || (
              <span className="text-foreground-dim italic">
                {originalText
                  ? 'Computing sanitized output...'
                  : 'Sanitized output will appear here after document analysis.'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Prominent Export Strip */}
      <div className="h-12 border-t border-border bg-surface-1 px-3 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center space-x-2 text-[11px] font-mono text-foreground-muted">
          <Lock className="w-3 h-3 text-accent" />
          <span>Zero-leakage local export</span>
        </div>

        <div className="relative flex items-center space-x-2">
          {/* Main Download Button */}
          <button
            onClick={onExportFile}
            disabled={!sanitizedText}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold font-mono bg-accent text-black hover:bg-accent-hover transition-colors shadow-xs disabled:opacity-40 disabled:pointer-events-none"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Sanitized File</span>
          </button>

          {/* Export Options Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-1.5 rounded-md border border-border bg-surface-2 text-foreground-muted hover:text-foreground transition-colors"
              title="More export options"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showExportMenu && (
              <div
                className="absolute right-0 bottom-full mb-2 w-56 rounded-md bg-surface-2 border border-border shadow-xl p-1 z-30 font-mono text-xs space-y-0.5"
                onMouseLeave={() => setShowExportMenu(false)}
              >
                <button
                  onClick={() => {
                    onExportAudit();
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded text-left text-foreground hover:bg-surface-3 transition-colors"
                >
                  <FileJson className="w-3.5 h-3.5 text-warning" />
                  <span>Export Audit Report (.json)</span>
                </button>

                <button
                  onClick={() => {
                    onExportMapping();
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded text-left text-foreground hover:bg-surface-3 transition-colors"
                >
                  <Table className="w-3.5 h-3.5 text-[#56D4DD]" />
                  <span>Download Mapping Table</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
