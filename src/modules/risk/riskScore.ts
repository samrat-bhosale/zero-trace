import { DetectedEntity, EntityType, ENTITY_CONFIGS } from '../detection/entityTypes';

export type RiskLevel = 'LOW RISK' | 'MODERATE RISK' | 'HIGH RISK' | 'CRITICAL RISK';

export interface PrivacyRiskAssessment {
  level: RiskLevel;
  score: number; // 0 - 100
  color: string;
  summary: string;
  reasons: string[];
  breakdown: {
    severityScore: number;
    diversityScore: number;
    volumeScore: number;
    criticalEntitiesFound: string[];
  };
}

/**
 * Feature A — Real, transparent document privacy risk score.
 * Calculated strictly from:
 * - Number of detected entities
 * - Entity severity (Credit card/Aadhaar/Secrets = 5, PAN = 4, Email/Phone = 3, IP = 2)
 * - Unique identifiers vs repeated identifiers
 * - Presence of financial identifiers
 * - Presence of government identifiers
 */
export function calculatePrivacyRisk(entities: DetectedEntity[]): PrivacyRiskAssessment {
  if (!entities || entities.length === 0) {
    return {
      level: 'LOW RISK',
      score: 0,
      color: '#B7F7D1', // accent green
      summary: 'No sensitive entities detected in this document.',
      reasons: ['Document contains no recognized PII, financial, or government identifiers.'],
      breakdown: {
        severityScore: 0,
        diversityScore: 0,
        volumeScore: 0,
        criticalEntitiesFound: [],
      },
    };
  }

  const reasons: string[] = [];
  const criticalFound: string[] = [];

  // 1. Group entities by category and count unique values
  const byType: Partial<Record<EntityType, Set<string>>> = {};
  let maxSeverity = 1;
  let severitySum = 0;

  for (const entity of entities) {
    if (!byType[entity.type]) {
      byType[entity.type] = new Set();
    }
    byType[entity.type]!.add(entity.normalizedValue);

    const config = ENTITY_CONFIGS[entity.type];
    const sev = config?.severity || 2;
    severitySum += sev;
    if (sev > maxSeverity) {
      maxSeverity = sev;
    }

    if (sev === 5 && !criticalFound.includes(config.label)) {
      criticalFound.push(config.label);
    }
  }

  // 2. Specific checks
  const hasCards = (byType.CREDIT_CARD?.size || 0) > 0;
  const hasAadhaar = (byType.AADHAAR?.size || 0) > 0;
  const hasPAN = (byType.INDIAN_PAN?.size || 0) > 0;
  const hasSecrets = (byType.API_KEY?.size || 0) > 0 || (byType.SECRET_TOKEN?.size || 0) > 0;
  const hasEmails = (byType.EMAIL?.size || 0) > 0;
  const hasPhones = (byType.PHONE?.size || 0) > 0;

  if (hasCards) {
    reasons.push(`Contains verified payment card identifiers (${byType.CREDIT_CARD!.size} unique). High regulatory risk under PCI-DSS.`);
  }
  if (hasAadhaar) {
    reasons.push(`Contains Indian Aadhaar national identification numbers (${byType.AADHAAR!.size} unique). Subject to strict Aadhaar Act compliance.`);
  }
  if (hasPAN) {
    reasons.push(`Contains Indian Permanent Account Number (PAN) tax identifiers (${byType.INDIAN_PAN!.size} unique).`);
  }
  if (hasSecrets) {
    reasons.push('Contains private API keys or authentication credentials. Critical exposure risk.');
  }
  if (hasEmails && hasPhones) {
    reasons.push(`Contains correlated direct contact info (${byType.EMAIL!.size} emails, ${byType.PHONE!.size} phones). Enables re-identification.`);
  }

  // 3. Compute normalized score components
  // Volume: up to 30 points
  const totalCount = entities.length;
  const volumeScore = Math.min(30, totalCount * 3);

  // Severity: up to 50 points
  let severityScore = (maxSeverity / 5) * 35;
  if (hasCards || hasAadhaar || hasSecrets) {
    severityScore += 15;
  }

  // Diversity: up to 20 points
  const typeCount = Object.keys(byType).length;
  const diversityScore = Math.min(20, typeCount * 5);

  const rawScore = Math.min(100, Math.round(volumeScore + severityScore + diversityScore));

  let level: RiskLevel = 'LOW RISK';
  let color = '#B7F7D1';

  if (rawScore >= 75 || hasCards || hasSecrets || (hasAadhaar && totalCount > 2)) {
    level = 'CRITICAL RISK';
    color = '#FF646E'; // Danger red
  } else if (rawScore >= 50 || hasAadhaar || hasPAN) {
    level = 'HIGH RISK';
    color = '#F2BD67'; // Warning amber
  } else if (rawScore >= 25 || totalCount > 1) {
    level = 'MODERATE RISK';
    color = '#79B8FF'; // Blue
  }

  let summary = `Assessed ${level} with ${totalCount} sensitive ${totalCount === 1 ? 'entity' : 'entities'} across ${typeCount} ${typeCount === 1 ? 'category' : 'categories'}.`;
  if (criticalFound.length > 0) {
    summary += ` Critical identifiers detected: ${criticalFound.join(', ')}.`;
  }

  return {
    level,
    score: rawScore,
    color,
    summary,
    reasons,
    breakdown: {
      severityScore: Math.round(severityScore),
      diversityScore,
      volumeScore,
      criticalEntitiesFound: criticalFound,
    },
  };
}
