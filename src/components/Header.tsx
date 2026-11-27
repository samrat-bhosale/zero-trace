import React, { useState } from 'react';
import {
  ShieldCheck,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import { PrivacyRiskAssessment } from '../modules/risk/riskScore';

interface HeaderProps {
  riskAssessment: PrivacyRiskAssessment;
  totalEntities: number;
  onClear: () => void;
  onOpenPrivacyModal: () => void;
  onOpenRiskModal: () => void;
  fileName: string | null;
  fileType: string;
}

export const Header: React.FC<HeaderProps> = ({
  riskAssessment,
  totalEntities,
  onClear,
  onOpenPrivacyModal,
  onOpenRiskModal,
  fileName,
  fileType,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  return (
    <header className="h-14 border-b border-border bg-surface-1 px-4 flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center space-x-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-sm font-semibold tracking-tight text-foreground">
              Data Sanitization Workspace
            </h1>
            {fileName && (
              <span className="text-xs px-2 py-0.5 rounded bg-surface-2 border border-border text-foreground-muted font-mono">
                {fileName} ({fileType.toUpperCase()})
              </span>
            )}
          </div>
          <p className="text-[11px] text-foreground-muted hidden sm:block">
            Detect sensitive information and sanitize documents locally.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2.5">
        {/* Risk Score Pill */}
        {totalEntities > 0 && (
          <button
            onClick={onOpenRiskModal}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border transition-colors hover:brightness-110"
            style={{
              backgroundColor: `${riskAssessment.color}15`,
              color: riskAssessment.color,
              borderColor: `${riskAssessment.color}40`,
            }}
            title="Click to view detailed Privacy Risk Breakdown"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{riskAssessment.level}</span>
            <span className="opacity-75">({riskAssessment.score}/100)</span>
          </button>
        )}

        {/* Local Processing Badge */}
        <button
          onClick={onOpenPrivacyModal}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-accent-dim text-accent border border-accent-border hover:bg-accent-dim/80 transition-colors"
          title="Click to inspect zero-transmission privacy guarantees"
        >
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="tracking-wide">LOCAL ONLY</span>
          <Info className="w-3 h-3 text-accent/80" />
        </button>

        {/* Clear Workspace Button */}
        {totalEntities > 0 || fileName ? (
          showClearConfirm ? (
            <div className="flex items-center space-x-1 bg-surface-2 p-0.5 rounded border border-danger-border">
              <span className="text-[11px] px-1.5 text-danger font-medium">Purge all?</span>
              <button
                onClick={() => {
                  onClear();
                  setShowClearConfirm(false);
                }}
                className="px-2 py-0.5 rounded bg-danger text-black text-[11px] font-semibold hover:brightness-110"
              >
                Yes
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-1.5 py-0.5 text-[11px] text-foreground-muted hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium text-foreground-muted hover:text-danger hover:bg-surface-2 border border-border transition-colors"
              title="Purge current document and all in-memory mappings"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )
        ) : null}
      </div>
    </header>
  );
};
