import { EntityType, ENTITY_CONFIGS } from '../detection/entityTypes';

export interface FullMaskOptions {
  customLabels?: Partial<Record<EntityType, string>>;
  defaultLabel?: string;
}

/**
 * Returns full mask replacement string for a detected entity type.
 */
export function getFullMask(type: EntityType, options?: FullMaskOptions): string {
  if (options?.customLabels?.[type]) {
    return options.customLabels[type]!;
  }

  const config = ENTITY_CONFIGS[type];
  if (config) {
    return config.defaultFullMask;
  }

  return options?.defaultLabel || '[REDACTED]';
}
