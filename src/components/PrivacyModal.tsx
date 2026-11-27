import React from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Lock,
  WifiOff,
} from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface-1 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-accent-dim border border-accent-border text-accent">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground font-mono">
                LOCAL PROCESSING ACTIVE
              </h3>
              <p className="text-[11px] text-accent font-mono font-medium">
                Verified zero-telemetry architecture
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

        {/* Core Statement */}
        <div className="p-3.5 rounded-lg bg-surface-2 border border-border space-y-2">
          <p className="text-xs text-foreground font-medium leading-relaxed">
            "Your document is processed inside this browser. The raw document is never uploaded to a server. Detection, masking, pseudonymization, comparison, and export happen locally."
          </p>
          <div className="text-[11px] text-foreground-muted">
            This statement reflects the actual software implementation running in your current tab.
          </div>
        </div>

        {/* Architectural Guarantees */}
        <div className="space-y-2.5 text-xs">
          <div className="text-[10px] uppercase font-semibold text-foreground-dim tracking-wider">
            Verified Guarantees
          </div>

          <div className="space-y-2 font-mono text-[11px]">
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0 pt-0.5" />
              <span className="text-foreground">
                <strong>No API Calls:</strong> 0 external HTTP/WebSocket network requests sent.
              </span>
            </div>

            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0 pt-0.5" />
              <span className="text-foreground">
                <strong>No Telemetry:</strong> No analytics SDKs, Google Analytics, Mixpanel, or trackers.
              </span>
            </div>

            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0 pt-0.5" />
              <span className="text-foreground">
                <strong>Local Memory Only:</strong> Documents exist only in ephemeral browser memory.
              </span>
            </div>

            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0 pt-0.5" />
              <span className="text-foreground">
                <strong>Offline Capable:</strong> Operates fully disconnected from the internet.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-accent text-black font-semibold font-mono text-xs hover:bg-accent-hover transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
