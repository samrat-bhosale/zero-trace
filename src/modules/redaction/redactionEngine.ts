import { DetectedEntity, EntityType, RedactionMode } from '../detection/entityTypes';
import { getFullMask, FullMaskOptions } from './fullMask';
import { getPartialMask, PartialMaskOptions } from './partialMask';
import { PseudonymEngine } from './pseudonymize';

export interface RedactionEngineOptions {
  globalMode: RedactionMode; // FULL | PARTIAL | PSEUDONYMIZE | IGNORE
  fullMaskOptions?: FullMaskOptions;
  partialMaskOptions?: PartialMaskOptions;
  pseudonymEngine?: PseudonymEngine;
  customReplacements?: Partial<Record<EntityType, string>>;
  ignoredEntityIds?: Set<string>;
}

export interface RedactionResult {
  sanitizedText: string;
  totalEntities: number;
  redactedCount: number;
  ignoredCount: number;
  sanitizationPercentage: number;
  replacements: Array<{
    entityId: string;
    type: EntityType;
    original: string;
    replacement: string;
    startIndex: number;
    endIndex: number;
  }>;
}

/**
 * Sanitizes input text based on detected entities and configured redaction modes.
 * Applies replacements from end to start (reverse index order) to avoid cascading offset errors.
 */
export function sanitizeText(
  originalText: string,
  entities: DetectedEntity[],
  options: RedactionEngineOptions
): RedactionResult {
  if (!originalText || entities.length === 0) {
    return {
      sanitizedText: originalText,
      totalEntities: entities.length,
      redactedCount: 0,
      ignoredCount: 0,
      sanitizationPercentage: 100,
      replacements: [],
    };
  }

  const pseudonymEngine = options.pseudonymEngine || new PseudonymEngine();
  // Reset pseudonym engine before fresh document run so numbering starts at 01
  pseudonymEngine.reset();

  const ignoredSet = options.ignoredEntityIds || new Set<string>();

  // First pass: compute replacement for each entity in original forward order
  // (so pseudonym numbering USER_01, USER_02 matches reading order)
  const sortedForward = [...entities].sort((a, b) => a.startIndex - b.startIndex);

  interface PreparedReplacement {
    entity: DetectedEntity;
    replacementText: string;
    shouldRedact: boolean;
  }

  const prepared: PreparedReplacement[] = [];

  for (const entity of sortedForward) {
    const isIgnored = ignoredSet.has(entity.id) || !entity.selected || entity.redactionMode === 'IGNORE';

    if (isIgnored) {
      prepared.push({
        entity,
        replacementText: entity.originalValue,
        shouldRedact: false,
      });
      continue;
    }

    // Determine mode: entity-specific override or globalMode
    const effectiveMode = entity.redactionMode || options.globalMode;

    let replacement = '';

    if (entity.customReplacement) {
      replacement = entity.customReplacement;
    } else if (options.customReplacements?.[entity.type]) {
      replacement = options.customReplacements[entity.type]!;
    } else if (effectiveMode === 'FULL') {
      replacement = getFullMask(entity.type, options.fullMaskOptions);
    } else if (effectiveMode === 'PARTIAL') {
      replacement = getPartialMask(entity.type, entity.originalValue, options.partialMaskOptions);
    } else if (effectiveMode === 'PSEUDONYMIZE') {
      replacement = pseudonymEngine.getPseudonym(
        entity.type,
        entity.originalValue,
        entity.normalizedValue,
        entity.startIndex
      );
    } else {
      replacement = entity.originalValue;
    }

    prepared.push({
      entity,
      replacementText: replacement,
      shouldRedact: true,
    });
  }

  // Second pass: apply replacements from the END toward the BEGINNING (reverse index)
  // This guarantees that startIndex and endIndex never shift for subsequent replacements!
  const sortedReverse = [...prepared].sort((a, b) => b.entity.startIndex - a.entity.startIndex);

  let resultText = originalText;
  const appliedReplacements: RedactionResult['replacements'] = [];
  let redactedCount = 0;
  let ignoredCount = 0;

  for (const item of sortedReverse) {
    const { entity, replacementText, shouldRedact } = item;

    if (!shouldRedact) {
      ignoredCount++;
      continue;
    }

    redactedCount++;
    const before = resultText.slice(0, entity.startIndex);
    const after = resultText.slice(entity.endIndex);

    resultText = before + replacementText + after;

    appliedReplacements.unshift({
      entityId: entity.id,
      type: entity.type,
      original: entity.originalValue,
      replacement: replacementText,
      startIndex: entity.startIndex,
      endIndex: entity.startIndex + replacementText.length,
    });
  }

  const totalEntities = entities.length;
  const sanitizationPercentage =
    totalEntities > 0
      ? Math.round((redactedCount / (redactedCount + ignoredCount)) * 100)
      : 100;

  return {
    sanitizedText: resultText,
    totalEntities,
    redactedCount,
    ignoredCount,
    sanitizationPercentage,
    replacements: appliedReplacements,
  };
}
