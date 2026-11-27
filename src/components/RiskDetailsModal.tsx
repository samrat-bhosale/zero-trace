import React from 'react';
import {
  X,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { PrivacyRiskAssessment } from '../modules/risk/riskScore';

interface RiskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: PrivacyRiskAssessment;
}

export const RiskDetailsModal: React.FC<RiskDetailsModalProps> = ({
  isOpen,
  onClose,
  assessment,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface-1 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center space-x-2.5">
            <div
              className="p-2 rounded-lg border flex items-center justify-center"
              style={{
                backgroundColor: `${assessment.color}15`,
                color: assessment.color,
                borderColor: `${assessment.color}40`,
              }}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-foreground font-mono">
                  {assessment.level}
                </h3>
                <span className="text-xs font-mono font-semibold" style={{ color: assessment.color }}>
                  ({assessment.score}/100)
                </span>
              </div>
              <p className="text-[11px] text-foreground-muted">
                See what raised or lowered this rating
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-foreground-muted hover:text-foreground hover:bg-surface-2 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary */}
        <div className="p-3.5 rounded-lg bg-surface-2 border border-border space-y-1">
          <div className="text-[10px] uppercase font-semibold text-foreground-dim tracking-wider">
            What this score means
          </div>
          <p className="text-[11px] text-foreground-muted leading-relaxed">
            The rating reflects the kinds and number of sensitive details found. The factors below show what contributed to it.
          </p>
          <p className="text-xs text-foreground leading-relaxed">
            {assessment.summary}
          </p>
        </div>

        {/* Transparent Reasons */}
        <div className="space-y-2 text-xs">
          <div className="text-[10px] uppercase font-semibold text-foreground-dim tracking-wider">
            Factors that contributed
          </div>
          <div className="space-y-1.5 font-mono text-[11px]">
            {assessment.reasons.length > 0 ? assessment.reasons.map((reason, idx) => (
              <div key={idx} className="flex items-start space-x-2 rounded border border-border/60 bg-surface-2 p-2">
                <span className="font-bold text-warning">•</span>
                <span className="leading-snug text-foreground">{reason}</span>
              </div>
            )) : (
              <div className="flex items-start space-x-2 rounded border border-border/60 bg-surface-2 p-2">
                <span className="font-bold text-warning">•</span>
                <span className="leading-snug text-foreground">No additional high-risk factors were triggered. The score is based on the number and sensitivity of the detected items.</span>
              </div>
            )}
          </div>
        </div>

        {/* Breakdown Breakdown Bars */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border font-mono text-center text-xs">
          <div className="p-2 rounded bg-surface-2 border border-border">
            <div className="text-[10px] text-foreground-dim uppercase">Severity</div>
            <div className="font-semibold text-foreground text-sm mt-0.5">
              {assessment.breakdown.severityScore}/50
            </div>
          </div>
          <div className="p-2 rounded bg-surface-2 border border-border">
            <div className="text-[10px] text-foreground-dim uppercase">Diversity</div>
            <div className="font-semibold text-foreground text-sm mt-0.5">
              {assessment.breakdown.diversityScore}/20
            </div>
          </div>
          <div className="p-2 rounded bg-surface-2 border border-border">
            <div className="text-[10px] text-foreground-dim uppercase">Volume</div>
            <div className="font-semibold text-foreground text-sm mt-0.5">
              {assessment.breakdown.volumeScore}/30
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-surface-2 border border-border text-foreground font-mono text-xs hover:bg-surface-3 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
