import React, { useState } from 'react';
import {
  X,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Lock,
} from 'lucide-react';
import {
  DetectedEntity,
  ENTITY_CONFIGS,
  RedactionMode,
} from '../modules/detection/entityTypes';
import { getFullMask } from '../modules/redaction/fullMask';
import { getPartialMask } from '../modules/redaction/partialMask';
import { PseudonymEngine } from '../modules/redaction/pseudonymize';

interface EntityInspectorProps {
  entity: DetectedEntity | null;
  allEntities: DetectedEntity[];
  onClose: () => void;
  onToggleIgnore: (id: string) => void;
  onSetMode: (id: string, mode: RedactionMode) => void;
  onIgnoreAllOfType: (type: DetectedEntity['type']) => void;
  onRedactAllOfType: (type: DetectedEntity['type']) => void;
  pseudonymEngine: PseudonymEngine;
}

export const EntityInspector: React.FC<EntityInspectorProps> = ({
  entity,
  allEntities,
  onClose,
  onToggleIgnore,
  onSetMode,
  onIgnoreAllOfType,
  onRedactAllOfType,
  pseudonymEngine,
}) => {
  const [revealValue, setRevealValue] = useState(false);

  if (!entity) return null;

  const config = ENTITY_CONFIGS[entity.type] || ENTITY_CONFIGS.CUSTOM;
  const isIgnored = !entity.selected || entity.redactionMode === 'IGNORE';

  // Occurrence count
  const sameOccurrences = allEntities.filter(
    (e) => e.type === entity.type && e.normalizedValue === entity.normalizedValue
  );

  // Compute live preview
  let maskPreview = entity.originalValue;
  if (!isIgnored) {
    if (entity.redactionMode === 'FULL') {
      maskPreview = getFullMask(entity.type);
    } else if (entity.redactionMode === 'PARTIAL') {
      maskPreview = getPartialMask(entity.type, entity.originalValue);
    } else if (entity.redactionMode === 'PSEUDONYMIZE') {
      maskPreview = pseudonymEngine.getPseudonym(
        entity.type,
        entity.originalValue,
        entity.normalizedValue,
        entity.startIndex
      );
    }
  }

  return (
    <div className="w-[320px] border-l border-border bg-surface-1 flex flex-col justify-between shrink-0 select-none animate-in slide-in-from-right-4 duration-200">
      <div>
        {/* Header */}
        <div className="h-12 border-b border-border px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: config.color.text }}
            />
            <span className="text-xs font-semibold text-foreground font-mono">
              Entity Inspector
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-foreground-muted hover:text-foreground hover:bg-surface-2 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Details */}
        <div className="p-4 space-y-4 text-xs">
          {/* Category & Confidence Badge */}
          <div>
            <div className="text-[10px] uppercase font-semibold text-foreground-dim tracking-wider mb-1">
              Entity Category
            </div>
            <div className="flex items-center justify-between">
              <span
                className="px-2 py-0.5 rounded font-mono font-medium text-xs border"
                style={{
                  backgroundColor: config.color.bg,
                  color: config.color.text,
                  borderColor: config.color.border,
                }}
              >
                {config.label}
              </span>
              <span
                className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold border ${
                  entity.confidence === 'HIGH'
                    ? 'bg-accent-dim text-accent border-accent-border'
                    : entity.confidence === 'MEDIUM'
                    ? 'bg-amber-500/10 text-warning border-amber-500/30'
                    : 'bg-rose-500/10 text-danger border-rose-500/30'
                }`}
              >
                {entity.confidence} CONFIDENCE
              </span>
            </div>
          </div>

          {/* Original Value with local Reveal / Hide */}
          <div>
            <div className="flex items-center justify-between text-[10px] uppercase font-semibold text-foreground-dim tracking-wider mb-1">
              <span>Detected Value</span>
              <button
                onClick={() => setRevealValue(!revealValue)}
                className="flex items-center space-x-1 text-foreground-muted hover:text-foreground"
              >
                {revealValue ? (
                  <>
                    <EyeOff className="w-3 h-3" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" />
                    <span>Reveal</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-2 rounded bg-surface-2 border border-border font-mono text-xs break-all text-foreground">
              {revealValue ? entity.originalValue : '••••••••••••••••'}
            </div>
          </div>

          {/* Validation Status & Details */}
          <div>
            <div className="text-[10px] uppercase font-semibold text-foreground-dim tracking-wider mb-1">
              Validation Evidence
            </div>
            <div className="p-2 rounded bg-surface-2 border border-border space-y-1">
              <div className="flex items-center space-x-1.5 text-foreground">
                <CheckCircle className="w-3.5 h-3.5 text-accent" />
                <span className="font-mono text-[11px]">{entity.validationDetails}</span>
              </div>
              <div className="text-[10px] text-foreground-dim">
                Source position: chars {entity.startIndex}–{entity.endIndex} (Line {entity.lineNumber})
              </div>
            </div>
          </div>

          {/* Document Occurrences */}
          <div>
            <div className="text-[10px] uppercase font-semibold text-foreground-dim tracking-wider mb-1">
              Occurrences in Document
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-surface-2 border border-border">
              <span className="font-mono text-foreground">
                {sameOccurrences.length} total occurrences
              </span>
              <div className="space-x-1">
                <button
                  onClick={() => onRedactAllOfType(entity.type)}
                  className="px-1.5 py-0.5 rounded bg-surface-3 text-[10px] font-mono text-accent hover:brightness-110"
                >
                  Redact All
                </button>
                <button
                  onClick={() => onIgnoreAllOfType(entity.type)}
                  className="px-1.5 py-0.5 rounded bg-surface-3 text-[10px] font-mono text-foreground-muted hover:text-foreground"
                >
                  Ignore All
                </button>
              </div>
            </div>
          </div>

          {/* Redaction Method Selection */}
          <div>
            <div className="text-[10px] uppercase font-semibold text-foreground-dim tracking-wider mb-1.5">
              Redaction Method
            </div>
            <div className="grid grid-cols-3 gap-1 bg-surface-2 p-1 rounded-md border border-border">
              <button
                onClick={() => onSetMode(entity.id, 'FULL')}
                className={`py-1 rounded text-[11px] font-mono transition-colors ${
                  entity.redactionMode === 'FULL' && !isIgnored
                    ? 'bg-surface-3 text-foreground font-semibold border border-border'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                Full Mask
              </button>
              <button
                onClick={() => onSetMode(entity.id, 'PARTIAL')}
                className={`py-1 rounded text-[11px] font-mono transition-colors ${
                  entity.redactionMode === 'PARTIAL' && !isIgnored
                    ? 'bg-surface-3 text-foreground font-semibold border border-border'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                Partial
              </button>
              <button
                onClick={() => onSetMode(entity.id, 'PSEUDONYMIZE')}
                className={`py-1 rounded text-[11px] font-mono transition-colors ${
                  entity.redactionMode === 'PSEUDONYMIZE' && !isIgnored
                    ? 'bg-surface-3 text-foreground font-semibold border border-border'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                Pseudo
              </button>
            </div>
          </div>

          {/* Mask Preview Box */}
          <div>
            <div className="text-[10px] uppercase font-semibold text-foreground-dim tracking-wider mb-1">
              Sanitized Output Preview
            </div>
            <div className="p-2.5 rounded bg-surface-2 border border-border font-mono text-xs text-accent break-all flex items-center justify-between">
              <span>{maskPreview}</span>
              <Lock className="w-3 h-3 text-accent/60" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3 border-t border-border bg-surface-1">
        <button
          onClick={() => onToggleIgnore(entity.id)}
          className={`w-full py-2 rounded-md text-xs font-semibold font-mono border transition-colors ${
            isIgnored
              ? 'bg-accent-dim text-accent border-accent-border hover:brightness-110'
              : 'bg-surface-2 text-foreground-muted hover:text-danger hover:border-danger-border border-border'
          }`}
        >
          {isIgnored ? '✓ Redact This Entity' : '✕ Ignore This Entity'}
        </button>
      </div>
    </div>
  );
};
