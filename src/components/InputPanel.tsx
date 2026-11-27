import React, { useRef, useState } from 'react';
import {
  FileText,
  Upload,
  Copy,
  Check,
  Eye,
  Edit3,
} from 'lucide-react';
import { DetectionHighlights } from './DetectionHighlights';
import { DetectedEntity } from '../modules/detection/entityTypes';
import { countWords, countLines } from '../utils/formatting';

interface InputPanelProps {
  originalText: string;
  setOriginalText: (text: string) => void;
  entities: DetectedEntity[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string) => void;
  onFileUpload: (file: File) => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  originalText,
  setOriginalText,
  entities,
  selectedEntityId,
  onSelectEntity,
  onFileUpload,
}) => {
  const [viewMode, setViewMode] = useState<'highlights' | 'edit'>('highlights');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = countWords(originalText);
  const charCount = originalText.length;
  const lineCount = countLines(originalText);

  const handleCopy = () => {
    if (!originalText) return;
    navigator.clipboard.writeText(originalText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="flex-1 h-full flex flex-col bg-surface-1 overflow-hidden"
    >
      {/* Top Bar */}
      <div className="h-10 border-b border-border bg-surface-2 px-3 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center space-x-2">
          <FileText className="w-3.5 h-3.5 text-foreground-muted" />
          <span className="text-xs font-semibold text-foreground">
            Original Document
          </span>

          {/* Toggle between Highlights & Raw Edit */}
          {originalText && (
            <div className="flex items-center bg-surface-3 p-0.5 rounded border border-border ml-2">
              <button
                onClick={() => setViewMode('highlights')}
                className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  viewMode === 'highlights'
                    ? 'bg-surface-1 text-foreground font-semibold shadow-xs'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                <Eye className="w-3 h-3 text-accent" />
                <span>Detected</span>
              </button>
              <button
                onClick={() => setViewMode('edit')}
                className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  viewMode === 'edit'
                    ? 'bg-surface-1 text-foreground font-semibold shadow-xs'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                <Edit3 className="w-3 h-3 text-foreground-muted" />
                <span>Raw Edit</span>
              </button>
            </div>
          )}
        </div>

        {/* Metadata & Quick Actions */}
        <div className="flex items-center space-x-3 text-[11px] font-mono text-foreground-muted">
          <span>{lineCount} lines</span>
          <span>{wordCount} words</span>
          <span>{charCount} chars</span>

          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.csv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onFileUpload(e.target.files[0]);
              }
            }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1 rounded hover:bg-surface-3 text-foreground-muted hover:text-foreground transition-colors"
            title="Upload .txt or .csv document"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-surface-3 text-foreground-muted hover:text-foreground transition-colors"
            title="Copy original document"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative bg-[#0B0D0F]">
        {viewMode === 'highlights' && originalText ? (
          <DetectionHighlights
            text={originalText}
            entities={entities}
            selectedEntityId={selectedEntityId}
            onSelectEntity={onSelectEntity}
          />
        ) : (
          <textarea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="Paste raw text, drop a .txt or .csv file here..."
            className="w-full h-full p-4 bg-transparent font-mono text-sm leading-relaxed text-foreground placeholder:text-foreground-dim focus:outline-none resize-none"
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
};
