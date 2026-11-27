import React from 'react';
import {
  FileText,
  Clock,
  Download,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Info,
} from 'lucide-react';
import { AuditLogEntry } from '../hooks/useSanitizer';

interface ProcessingLogProps {
  logs: AuditLogEntry[];
  onClearLogs: () => void;
  onExportAudit: () => void;
}

export const ProcessingLog: React.FC<ProcessingLogProps> = ({
  logs,
  onClearLogs,
  onExportAudit,
}) => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground flex items-center space-x-2">
            <Clock className="w-4 h-4 text-warning" />
            <span>Audit & Processing Log</span>
          </h2>
          <p className="text-xs text-foreground-muted mt-0.5">
            Real-time chronological events. Raw sensitive values are strictly excluded from all audit records.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={onExportAudit}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-accent text-black font-semibold hover:bg-accent-hover transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit (.json)</span>
          </button>
          <button
            onClick={onClearLogs}
            className="p-1.5 rounded border border-border bg-surface-2 text-foreground-muted hover:text-foreground transition-colors"
            title="Clear processing log"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface-1 divide-y divide-border/40 font-mono text-xs max-h-[500px] overflow-y-auto">
        {logs.map((log) => (
          <div
            key={log.id}
            className="p-3 flex items-start space-x-3 hover:bg-surface-2/40 transition-colors"
          >
            <span className="text-foreground-dim text-[11px] shrink-0 pt-0.5">
              {log.timestamp}
            </span>

            <div className="shrink-0 pt-0.5">
              {log.type === 'security' ? (
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              ) : log.type === 'success' ? (
                <span className="text-accent">✓</span>
              ) : log.type === 'warn' ? (
                <AlertCircle className="w-3.5 h-3.5 text-warning" />
              ) : (
                <Info className="w-3.5 h-3.5 text-blue" />
              )}
            </div>

            <div className="flex-1 text-foreground break-all leading-relaxed">
              {log.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
