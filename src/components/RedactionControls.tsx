import React, { useState } from 'react';
import {
  Sliders,
  ShieldAlert,
  Sparkles,
  Plus,
  Trash2,
  Lock,
  Code,
  Check,
} from 'lucide-react';
import {
  EntityType,
  ENTITY_CONFIGS,
  RedactionMode,
  CustomRule,
  DetectedEntity,
} from '../modules/detection/entityTypes';

interface RedactionControlsProps {
  globalMode: RedactionMode;
  setGlobalMode: (mode: RedactionMode) => void;
  preset: 'strict' | 'analytics' | 'review' | 'custom';
  applyPreset: (preset: 'strict' | 'analytics' | 'review' | 'custom') => void;
  enabledTypes: Record<EntityType, boolean>;
  setEnabledTypes: React.Dispatch<React.SetStateAction<Record<EntityType, boolean>>>;
  customRules: CustomRule[];
  setCustomRules: React.Dispatch<React.SetStateAction<CustomRule[]>>;
  entities: DetectedEntity[];
}

export const RedactionControls: React.FC<RedactionControlsProps> = ({
  globalMode,
  setGlobalMode,
  preset,
  applyPreset,
  enabledTypes,
  setEnabledTypes,
  customRules,
  setCustomRules,
  entities,
}) => {
  // New rule form state
  const [newRuleName, setNewRuleName] = useState('');
  const [newRulePattern, setNewRulePattern] = useState('');
  const [newRuleReplacement, setNewRuleReplacement] = useState('[CONFIDENTIAL]');
  const [showAddRule, setShowAddRule] = useState(false);
  const [regexError, setRegexError] = useState<string | null>(null);

  const toggleType = (type: EntityType) => {
    setEnabledTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    setRegexError(null);

    if (!newRuleName.trim() || !newRulePattern.trim()) {
      setRegexError('Rule name and regex pattern are required.');
      return;
    }

    try {
      new RegExp(newRulePattern);
    } catch (err: unknown) {
      setRegexError(err instanceof Error ? err.message : 'Invalid regex pattern');
      return;
    }

    const rule: CustomRule = {
      id: `custom-rule-${Date.now()}`,
      name: newRuleName.trim(),
      pattern: newRulePattern.trim(),
      flags: 'g',
      replacement: newRuleReplacement.trim() || '[REDACTED]',
      type: 'CUSTOM',
      enabled: true,
      description: `User pattern: ${newRulePattern}`,
    };

    setCustomRules((prev) => [...prev, rule]);
    setNewRuleName('');
    setNewRulePattern('');
    setNewRuleReplacement('[CONFIDENTIAL]');
    setShowAddRule(false);
  };

  const removeRule = (id: string) => {
    setCustomRules((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-foreground select-none">
      {/* Title */}
      <div>
        <h2 className="text-base font-semibold tracking-tight text-foreground flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-accent" />
          <span>Sanitization Rules & Presets</span>
        </h2>
        <p className="text-xs text-foreground-muted mt-0.5">
          Configure detection scopes, automated masking strategies, and custom regex policies.
        </p>
      </div>

      {/* Preset Profiles */}
      <div className="space-y-2">
        <label className="text-xs uppercase font-semibold text-foreground-dim tracking-wider">
          Compliance Presets
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => applyPreset('strict')}
            className={`p-3 rounded-lg border text-left transition-all ${
              preset === 'strict'
                ? 'bg-surface-2 border-accent text-foreground shadow-xs'
                : 'bg-surface-1 border-border text-foreground-muted hover:border-border-focus'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-xs text-foreground font-mono">Strict Privacy</span>
              {preset === 'strict' && <Check className="w-3.5 h-3.5 text-accent" />}
            </div>
            <p className="text-[11px] text-foreground-dim leading-snug">
              Full masking on all sensitive entities. Zero residual context exposure.
            </p>
          </button>

          <button
            onClick={() => applyPreset('analytics')}
            className={`p-3 rounded-lg border text-left transition-all ${
              preset === 'analytics'
                ? 'bg-surface-2 border-blue text-foreground shadow-xs'
                : 'bg-surface-1 border-border text-foreground-muted hover:border-border-focus'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-xs text-foreground font-mono">Analytics Friendly</span>
              {preset === 'analytics' && <Check className="w-3.5 h-3.5 text-blue" />}
            </div>
            <p className="text-[11px] text-foreground-dim leading-snug">
              Consistent pseudonymization (USER_01, IP_01). Preserves joins and queryability.
            </p>
          </button>

          <button
            onClick={() => applyPreset('review')}
            className={`p-3 rounded-lg border text-left transition-all ${
              preset === 'review'
                ? 'bg-surface-2 border-warning text-foreground shadow-xs'
                : 'bg-surface-1 border-border text-foreground-muted hover:border-border-focus'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-xs text-foreground font-mono">Human Review</span>
              {preset === 'review' && <Check className="w-3.5 h-3.5 text-warning" />}
            </div>
            <p className="text-[11px] text-foreground-dim leading-snug">
              Partial masking (a***@domain, XXXX 1234). Allows visual auditing and verification.
            </p>
          </button>

          <button
            onClick={() => applyPreset('custom')}
            className={`p-3 rounded-lg border text-left transition-all ${
              preset === 'custom'
                ? 'bg-surface-2 border-border-focus text-foreground shadow-xs'
                : 'bg-surface-1 border-border text-foreground-muted hover:border-border-focus'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-xs text-foreground font-mono">Custom Rules</span>
              {preset === 'custom' && <Check className="w-3.5 h-3.5 text-foreground" />}
            </div>
            <p className="text-[11px] text-foreground-dim leading-snug">
              Manually tuned scopes, category overrides, and bespoke regex matchers.
            </p>
          </button>
        </div>
      </div>

      {/* Global Mode Switcher */}
      <div className="space-y-2">
        <label className="text-xs uppercase font-semibold text-foreground-dim tracking-wider">
          Default Redaction Mode
        </label>
        <div className="grid grid-cols-3 gap-2 bg-surface-2 p-1 rounded-lg border border-border">
          <button
            onClick={() => setGlobalMode('FULL')}
            className={`py-2 rounded-md font-mono text-xs font-medium transition-colors ${
              globalMode === 'FULL'
                ? 'bg-surface-3 text-foreground font-semibold border border-border'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            [REDACTED] Full Mask
          </button>
          <button
            onClick={() => setGlobalMode('PARTIAL')}
            className={`py-2 rounded-md font-mono text-xs font-medium transition-colors ${
              globalMode === 'PARTIAL'
                ? 'bg-surface-3 text-foreground font-semibold border border-border'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            a***@domain Partial Mask
          </button>
          <button
            onClick={() => setGlobalMode('PSEUDONYMIZE')}
            className={`py-2 rounded-md font-mono text-xs font-medium transition-colors ${
              globalMode === 'PSEUDONYMIZE'
                ? 'bg-surface-3 text-foreground font-semibold border border-border'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            USER_01 Pseudonymization
          </button>
        </div>
      </div>

      {/* Entity Category Toggles */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs uppercase font-semibold text-foreground-dim tracking-wider">
            Detected Entity Categories
          </label>
          <span className="text-[11px] text-foreground-muted">
            Toggle scopes to include/exclude from local scans
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {(Object.keys(ENTITY_CONFIGS) as EntityType[]).map((type) => {
            const config = ENTITY_CONFIGS[type];
            const isEnabled = enabledTypes[type];
            const count = entities.filter((e) => e.type === type).length;

            return (
              <div
                key={type}
                onClick={() => toggleType(type)}
                className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                  isEnabled
                    ? 'bg-surface-2 border-border hover:border-border-focus'
                    : 'bg-surface-1 border-border/40 opacity-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: config.color.text }}
                  />
                  <span className="text-xs font-medium text-foreground">
                    {config.label}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {count > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-3 text-foreground-muted">
                      {count}
                    </span>
                  )}
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center text-[10px] border ${
                      isEnabled
                        ? 'bg-accent-dim text-accent border-accent-border'
                        : 'border-border text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Regex Rules */}
      <div className="space-y-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs uppercase font-semibold text-foreground-dim tracking-wider">
              Custom Regex Rules (Feature E)
            </h3>
            <p className="text-[11px] text-foreground-muted">
              Add domain-specific proprietary identifiers or internal customer account patterns.
            </p>
          </div>

          <button
            onClick={() => setShowAddRule(!showAddRule)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-surface-2 border border-border text-xs font-mono hover:bg-surface-3 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-accent" />
            <span>Add Regex Rule</span>
          </button>
        </div>

        {/* Add Rule Form */}
        {showAddRule && (
          <form
            onSubmit={handleAddRule}
            className="p-4 rounded-lg bg-surface-2 border border-border space-y-3 font-mono text-xs animate-in fade-in-50 duration-150"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] uppercase text-foreground-dim mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  placeholder="e.g. Employee ID"
                  className="w-full px-2.5 py-1.5 rounded bg-surface-1 border border-border text-foreground focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-foreground-dim mb-1">
                  Regex Pattern
                </label>
                <input
                  type="text"
                  value={newRulePattern}
                  onChange={(e) => setNewRulePattern(e.target.value)}
                  placeholder="e.g. EMP-[0-9]{5}"
                  className="w-full px-2.5 py-1.5 rounded bg-surface-1 border border-border text-foreground focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-foreground-dim mb-1">
                  Replacement Label
                </label>
                <input
                  type="text"
                  value={newRuleReplacement}
                  onChange={(e) => setNewRuleReplacement(e.target.value)}
                  placeholder="e.g. [EMP_ID]"
                  className="w-full px-2.5 py-1.5 rounded bg-surface-1 border border-border text-foreground focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {regexError && (
              <div className="text-[11px] text-danger">{regexError}</div>
            )}

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddRule(false)}
                className="px-3 py-1 rounded text-foreground-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-accent text-black font-semibold hover:bg-accent-hover"
              >
                Save Rule
              </button>
            </div>
          </form>
        )}

        {/* Existing Custom Rules List */}
        {customRules.length > 0 && (
          <div className="space-y-1.5 font-mono text-xs">
            {customRules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-2.5 rounded bg-surface-2 border border-border"
              >
                <div className="flex items-center space-x-3">
                  <Code className="w-3.5 h-3.5 text-accent" />
                  <span className="font-semibold text-foreground">{rule.name}</span>
                  <span className="text-foreground-dim text-[11px]">/{rule.pattern}/g</span>
                  <span className="text-accent text-[11px]">→ {rule.replacement}</span>
                </div>
                <button
                  onClick={() => removeRule(rule.id)}
                  className="p-1 rounded text-foreground-muted hover:text-danger hover:bg-surface-3 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
