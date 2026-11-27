import React, { useRef, useState } from 'react';
import { FileText, FileSpreadsheet, LockKeyhole, Sparkles, Upload } from 'lucide-react';

interface EmptyStateProps {
  onLoadSampleText: () => void;
  onLoadSampleCSV: () => void;
  onFileUpload: (file: File) => void;
  onPasteText: (text: string) => void;
  isProcessing?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onLoadSampleText, onLoadSampleCSV, onFileUpload, onPasteText, isProcessing = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const acceptFile = (file?: File) => {
    if (file) onFileUpload(file);
    setIsDragging(false);
  };

  return (
    <section aria-busy={isProcessing} className="rounded-2xl border border-[#D6CCC2] bg-white p-5 shadow-card dark:border-[#554A40] dark:bg-[#37312C] sm:p-7">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#E3D5CA] text-[#746250] dark:bg-[#494138] dark:text-[#F5EBE0]">
            <FileText className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-[#3D3732] dark:text-white">Start with a document</h2>
          <p className="mt-1 text-sm text-[#766C63] dark:text-[#C4B7A9]">Paste text or choose a local file to find details to redact.</p>
        </div>

        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Paste document text here…"
          aria-label="Paste document text"
          className="min-h-32 w-full resize-y rounded-xl border border-[#D6CCC2] bg-[#F5EBE0] p-3.5 text-sm leading-6 text-[#3D3732] outline-none transition placeholder:text-[#988B80] focus:border-[#746250] focus:ring-4 focus:ring-[#746250]/10 dark:border-[#5B5046] dark:bg-[#0F1728] dark:text-white dark:placeholder:text-[#BBAE9F]"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onPasteText(draft.trim())}
            disabled={!draft.trim() || isProcessing}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#746250] px-4 text-xs font-semibold text-white transition hover:bg-[#5D4C3E] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#746250]/50 focus-visible:ring-offset-2"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {isProcessing ? 'Preparing document…' : 'Scan pasted text'}
          </button>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#746250] dark:text-[#67C4A8]">
            <LockKeyhole className="h-3.5 w-3.5" />
            Processed on this device
          </div>
        </div>

        <div
          onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsDragging(false); }}
          onDrop={(event) => { event.preventDefault(); acceptFile(event.dataTransfer.files?.[0]); }}
          className={`mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed px-4 py-3 transition-colors ${isDragging ? 'border-[#746250] bg-[#E3D5CA] dark:bg-[#494138]' : 'border-[#D6CCC2] bg-[#EDEDE9] dark:border-[#5B5046] dark:bg-[#413A34]'}`}
        >
          <div>
            <p className="text-xs font-semibold text-[#55483F] dark:text-[#E2E8F0]">Or drop a file here</p>
            <p className="mt-0.5 text-[11px] text-[#766C63] dark:text-[#BBAE9F]">TXT and CSV files · up to 20 MB</p>
          </div>
          <input ref={fileInputRef} type="file" accept=".txt,.csv" className="hidden" onChange={(event) => { acceptFile(event.target.files?.[0]); event.target.value = ''; }} />
          <button type="button" disabled={isProcessing} onClick={() => fileInputRef.current?.click()} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#D6CCC2] bg-white px-3 text-xs font-semibold text-[#55483F] transition hover:border-[#746250]/40 hover:bg-[#E3D5CA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#746250]/50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#5B5046] dark:bg-[#37312C] dark:text-[#E2E8F0] dark:hover:bg-[#494138]">
            <Upload className="h-3.5 w-3.5" /> Browse files
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 border-t border-[#E3D5CA] pt-4 dark:border-[#554A40]">
          <span className="mr-1 text-[11px] text-[#766C63] dark:text-[#BBAE9F]">Want to explore first?</span>
          <button type="button" disabled={isProcessing} onClick={onLoadSampleText} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#D6CCC2] bg-white px-3 text-xs font-semibold text-[#55483F] transition hover:border-[#746250]/40 hover:bg-[#E3D5CA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#746250]/50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#5B5046] dark:bg-[#37312C] dark:text-[#E2E8F0] dark:hover:bg-[#494138]">
            <FileText className="h-3.5 w-3.5 text-[#746250]" /> Sample text
          </button>
          <button type="button" disabled={isProcessing} onClick={onLoadSampleCSV} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#D6CCC2] bg-white px-3 text-xs font-semibold text-[#55483F] transition hover:border-[#746250]/40 hover:bg-[#F5EBE0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#746250]/40 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#5B5046] dark:bg-[#37312C] dark:text-[#E2E8F0] dark:hover:bg-[#12372F]">
            <FileSpreadsheet className="h-3.5 w-3.5 text-[#746250]" /> Sample CSV
          </button>
        </div>
      </div>
    </section>
  );
};
