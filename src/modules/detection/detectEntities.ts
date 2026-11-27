import {
  ConfidenceLevel,
  DetectedEntity,
  DetectionOptions,
  EntityType,
  ENTITY_CONFIGS,
  ValidationStatus,
  RedactionMode,
} from './entityTypes';
import { validateLuhn, detectCardBrand } from './luhn';
import { validateAadhaar } from './aadhaarValidation';
import {
  validateIPv4,
  validateIPv6,
  validatePAN,
  validatePhoneNumber,
  validateEmail,
} from './patterns';
import { calculateConfidence } from './confidence';

interface RawCandidate {
  type: EntityType;
  label: string;
  originalValue: string;
  normalizedValue: string;
  startIndex: number;
  endIndex: number;
  validationStatus: ValidationStatus;
  validationDetails?: string;
  priority: number; // Higher wins during overlap
}

const TYPE_PRIORITIES: Record<EntityType, number> = {
  CREDIT_CARD: 100, // Highest specificity when Luhn passes
  AADHAAR: 90,
  INDIAN_PAN: 85,
  EMAIL: 80,
  IPV4: 75,
  IPV6: 75,
  CUSTOMER_NAME: 72,
  API_KEY: 70,
  SECRET_TOKEN: 70,
  CUSTOM: 65,
  PHONE: 50,
  DATE_OF_BIRTH: 40,
};

/**
 * Scans text, detects sensitive entities, validates them, resolves overlaps,
 * and produces a sorted array of detected entities.
 */
export function detectEntities(
  text: string,
  options?: Partial<DetectionOptions>
): DetectedEntity[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const enabledTypes = options?.enabledTypes || {
    CUSTOMER_NAME: true,
    EMAIL: true,
    PHONE: true,
    IPV4: true,
    IPV6: true,
    INDIAN_PAN: true,
    AADHAAR: true,
    CREDIT_CARD: true,
    API_KEY: true,
    SECRET_TOKEN: true,
    DATE_OF_BIRTH: true,
    CUSTOM: true,
  };

  const candidates: RawCandidate[] = [];

  // 1. CREDIT CARDS (with Luhn validation)
  if (enabledTypes.CREDIT_CARD) {
    // Matches 13-19 digit candidates with optional spaces or hyphens
    const cardRegex = /\b(?:\d[ -]?){13,19}\b/g;
    let match: RegExpExecArray | null;
    while ((match = cardRegex.exec(text)) !== null) {
      const originalValue = match[0].trim();
      const digits = originalValue.replace(/\D/g, '');

      // Must be standard card length
      if (digits.length >= 13 && digits.length <= 19) {
        if (validateLuhn(digits)) {
          const brand = detectCardBrand(digits);
          candidates.push({
            type: 'CREDIT_CARD',
            label: `${brand} (${digits.slice(-4)})`,
            originalValue,
            normalizedValue: digits,
            startIndex: match.index,
            endIndex: match.index + originalValue.length,
            validationStatus: 'VALID',
            validationDetails: `Luhn verified ${brand}`,
            priority: TYPE_PRIORITIES.CREDIT_CARD,
          });
        }
        // If Luhn fails, we do NOT classify as credit card! (Explicit requirement)
      }
    }
  }

  // 2. AADHAAR NUMBERS
  if (enabledTypes.AADHAAR) {
    // 12 digits, often formatted as 4-4-4 with space or hyphen
    const aadhaarRegex = /\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/g;
    let match: RegExpExecArray | null;
    while ((match = aadhaarRegex.exec(text)) !== null) {
      const originalValue = match[0].trim();
      const digits = originalValue.replace(/\D/g, '');
      const validation = validateAadhaar(digits);

      // Check if context has Aadhaar or standard 12-digit format
      const isContextualAadhaar = /aadhaar|uid/i.test(text.slice(Math.max(0, match.index - 20), match.index));

      if (validation.isValidFormat || (digits.length === 12 && isContextualAadhaar)) {
        candidates.push({
          type: 'AADHAAR',
          label: 'Aadhaar Number',
          originalValue,
          normalizedValue: `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)}`,
          startIndex: match.index,
          endIndex: match.index + originalValue.length,
          validationStatus: validation.passesVerhoeff ? 'VALID' : 'SUSPECT',
          validationDetails: validation.reason || '12-digit format matched',
          priority: validation.passesVerhoeff ? TYPE_PRIORITIES.AADHAAR : TYPE_PRIORITIES.AADHAAR - 10,
        });
      }
    }
  }

  // 2.1 CUSTOMER NAME (contextual detection for headers like Customer: Aarav Mehta)
  if (enabledTypes.CUSTOMER_NAME) {
    const customerRegex = /(?:Customer|Client|Name|User):\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;
    let match: RegExpExecArray | null;
    while ((match = customerRegex.exec(text)) !== null) {
      const namePart = match[1];
      const startIdx = match.index + match[0].indexOf(namePart);
      candidates.push({
        type: 'CUSTOMER_NAME',
        label: 'Customer Name',
        originalValue: namePart,
        normalizedValue: namePart.trim(),
        startIndex: startIdx,
        endIndex: startIdx + namePart.length,
        validationStatus: 'VALID',
        validationDetails: 'Named entity context verified',
        priority: TYPE_PRIORITIES.CUSTOMER_NAME,
      });
    }
  }

  // 3. INDIAN PAN
  if (enabledTypes.INDIAN_PAN) {
    // 5 letters, 4 numbers, 1 letter (case insensitive match, normalized uppercase)
    const panRegex = /\b[A-Za-z]{5}[0-9]{4}[A-Za-z]\b/g;
    let match: RegExpExecArray | null;
    while ((match = panRegex.exec(text)) !== null) {
      const originalValue = match[0].trim();
      const validation = validatePAN(originalValue);
      if (validation.isValid) {
        candidates.push({
          type: 'INDIAN_PAN',
          label: `Indian PAN (${validation.holderType || 'Entity'})`,
          originalValue,
          normalizedValue: originalValue.toUpperCase(),
          startIndex: match.index,
          endIndex: match.index + originalValue.length,
          validationStatus: 'VALID',
          validationDetails: `PAN for ${validation.holderType}`,
          priority: TYPE_PRIORITIES.INDIAN_PAN,
        });
      }
    }
  }

  // 4. EMAIL ADDRESSES
  if (enabledTypes.EMAIL) {
    // Avoid trailing punctuation like periods, commas, colons, quotes
    const emailRegex = /\b[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+\b/g;
    let match: RegExpExecArray | null;
    while ((match = emailRegex.exec(text)) !== null) {
      let originalValue = match[0];
      // Strip any trailing punctuation that regex might have grabbed
      originalValue = originalValue.replace(/[.,;!?:"'>)]+$/, '');

      if (validateEmail(originalValue)) {
        candidates.push({
          type: 'EMAIL',
          label: 'Email Address',
          originalValue,
          normalizedValue: originalValue.toLowerCase(),
          startIndex: match.index,
          endIndex: match.index + originalValue.length,
          validationStatus: 'VALID',
          validationDetails: 'RFC 5322 syntax verified',
          priority: TYPE_PRIORITIES.EMAIL,
        });
      }
    }
  }

  // 5. IPV4 ADDRESSES
  if (enabledTypes.IPV4) {
    const ipv4Regex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
    let match: RegExpExecArray | null;
    while ((match = ipv4Regex.exec(text)) !== null) {
      const originalValue = match[0].trim();
      if (validateIPv4(originalValue)) {
        candidates.push({
          type: 'IPV4',
          label: 'IPv4 Address',
          originalValue,
          normalizedValue: originalValue,
          startIndex: match.index,
          endIndex: match.index + originalValue.length,
          validationStatus: 'VALID',
          validationDetails: 'Octet range 0-255 verified',
          priority: TYPE_PRIORITIES.IPV4,
        });
      }
    }
  }

  // 6. IPV6 ADDRESSES
  if (enabledTypes.IPV6) {
    const ipv6Regex = /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b|\b(?:[0-9a-fA-F]{1,4}:){1,7}:[0-9a-fA-F]{1,4}\b/g;
    let match: RegExpExecArray | null;
    while ((match = ipv6Regex.exec(text)) !== null) {
      const originalValue = match[0].trim();
      if (validateIPv6(originalValue)) {
        candidates.push({
          type: 'IPV6',
          label: 'IPv6 Address',
          originalValue,
          normalizedValue: originalValue.toLowerCase(),
          startIndex: match.index,
          endIndex: match.index + originalValue.length,
          validationStatus: 'VALID',
          validationDetails: 'IPv6 address structure verified',
          priority: TYPE_PRIORITIES.IPV6,
        });
      }
    }
  }

  // 7. PHONE NUMBERS (International and Indian)
  if (enabledTypes.PHONE) {
    // Supports +91 98765 43210, +91-98765-43210, +1 (415) 555-0132, 9876543210, etc.
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]*)?(?:\(?\d{2,5}\)?[-.\s]*)?\d{3,5}[-.\s]?\d{3,5}\b/g;
    let match: RegExpExecArray | null;
    while ((match = phoneRegex.exec(text)) !== null) {
      const originalValue = match[0].trim();
      const validation = validatePhoneNumber(originalValue);
      if (validation.isValid) {
        candidates.push({
          type: 'PHONE',
          label: validation.countryCode ? `Phone (${validation.countryCode})` : 'Phone Number',
          originalValue,
          normalizedValue: validation.normalized,
          startIndex: match.index,
          endIndex: match.index + originalValue.length,
          validationStatus: 'VALID',
          validationDetails: validation.countryCode ? `Valid ${validation.countryCode} dial plan` : 'Valid length',
          priority: TYPE_PRIORITIES.PHONE,
        });
      }
    }
  }

  // 8. API KEYS & SECRET TOKENS
  if (enabledTypes.API_KEY || enabledTypes.SECRET_TOKEN) {
    // OpenAI / Stripe / GitHub / AWS style keys
    const secretPatterns = [
      { regex: /\b(?:sk_live_|sk_test_)[0-9a-zA-Z]{24,}\b/g, label: 'Stripe API Secret', type: 'API_KEY' as EntityType },
      { regex: /\bghp_[0-9a-zA-Z]{36}\b/g, label: 'GitHub Personal Token', type: 'SECRET_TOKEN' as EntityType },
      { regex: /\bAKIA[0-9A-Z]{16}\b/g, label: 'AWS Access Key ID', type: 'API_KEY' as EntityType },
      { regex: /\beyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/g, label: 'JWT Bearer Token', type: 'SECRET_TOKEN' as EntityType },
    ];

    for (const pat of secretPatterns) {
      let match: RegExpExecArray | null;
      while ((match = pat.regex.exec(text)) !== null) {
        const originalValue = match[0].trim();
        candidates.push({
          type: pat.type,
          label: pat.label,
          originalValue,
          normalizedValue: originalValue,
          startIndex: match.index,
          endIndex: match.index + originalValue.length,
          validationStatus: 'VALID',
          validationDetails: pat.label,
          priority: TYPE_PRIORITIES[pat.type],
        });
      }
    }
  }

  // 9. DATE OF BIRTH
  if (enabledTypes.DATE_OF_BIRTH) {
    const dobRegex = /\b(?:DOB|Birth|Born|Date of Birth)[:\s]+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/gi;
    let match: RegExpExecArray | null;
    while ((match = dobRegex.exec(text)) !== null) {
      const fullMatch = match[0];
      const datePart = match[1];
      const dateStart = match.index + fullMatch.indexOf(datePart);
      candidates.push({
        type: 'DATE_OF_BIRTH',
        label: 'Date of Birth',
        originalValue: datePart,
        normalizedValue: datePart,
        startIndex: dateStart,
        endIndex: dateStart + datePart.length,
        validationStatus: 'VALID',
        validationDetails: 'DOB context verified',
        priority: TYPE_PRIORITIES.DATE_OF_BIRTH,
      });
    }
  }

  // 10. CUSTOM USER REGEX RULES
  if (enabledTypes.CUSTOM && options?.customRules) {
    for (const rule of options.customRules) {
      if (!rule.enabled || !rule.pattern) continue;
      try {
        const userRegex = new RegExp(rule.pattern, rule.flags || 'g');
        let match: RegExpExecArray | null;
        while ((match = userRegex.exec(text)) !== null) {
          const originalValue = match[0];
          if (!originalValue) break; // prevent infinite loop on empty match
          candidates.push({
            type: 'CUSTOM',
            label: rule.name || 'Custom Rule',
            originalValue,
            normalizedValue: originalValue,
            startIndex: match.index,
            endIndex: match.index + originalValue.length,
            validationStatus: 'VALID',
            validationDetails: rule.description || `Matched rule ${rule.name}`,
            priority: TYPE_PRIORITIES.CUSTOM,
          });
        }
      } catch (err) {
        console.warn(`Invalid custom regex: ${rule.pattern}`, err);
      }
    }
  }

  // SMART OVERLAP RESOLUTION
  // Sort candidates by priority DESC, then length DESC
  const resolvedCandidates = resolveOverlaps(candidates);

  // Convert to DetectedEntity and sort by startIndex ASC
  const entities: DetectedEntity[] = resolvedCandidates
    .map((candidate, idx) => {
      const conf = calculateConfidence(
        candidate.type,
        candidate.validationStatus,
        text,
        candidate.startIndex,
        candidate.endIndex,
        candidate.validationDetails
      );

      const entityConfig = ENTITY_CONFIGS[candidate.type] || ENTITY_CONFIGS.CUSTOM;

      // Calculate line and column numbers
      const textBefore = text.slice(0, candidate.startIndex);
      const lines = textBefore.split('\n');
      const lineNumber = lines.length;
      const columnNumber = lines[lines.length - 1].length + 1;

      return {
        id: `entity-${idx + 1}-${candidate.startIndex}`,
        type: candidate.type,
        label: candidate.label,
        originalValue: candidate.originalValue,
        normalizedValue: candidate.normalizedValue,
        startIndex: candidate.startIndex,
        endIndex: candidate.endIndex,
        confidence: conf.level,
        confidenceScore: conf.score,
        validationStatus: candidate.validationStatus,
        validationDetails: candidate.validationDetails || conf.reason,
        selected: true,
        // Leave redaction mode undefined initially so it respects global mode unless individually overridden
        redactionMode: undefined,
        lineNumber,
        columnNumber,
      };
    })
    .sort((a, b) => a.startIndex - b.startIndex);

  // If minConfidence filter is set, filter accordingly
  if (options?.minConfidence) {
    const minConf = options.minConfidence;
    return entities.filter((e) => {
      if (minConf === 'HIGH') return e.confidence === 'HIGH';
      if (minConf === 'MEDIUM') return e.confidence === 'HIGH' || e.confidence === 'MEDIUM';
      return true;
    });
  }

  return entities;
}

/**
 * Smart overlap resolution algorithm:
 * - Checks if candidate ranges intersect
 * - Higher priority wins (e.g. valid Luhn credit card wins over phone number)
 * - If equal priority, the longer match wins
 * - Prevents double-redacting the same text segment
 */
export function resolveOverlaps(candidates: RawCandidate[]): RawCandidate[] {
  if (candidates.length <= 1) return candidates;

  // Sort by priority DESC, then length DESC, then startIndex ASC
  const sorted = [...candidates].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    const lenA = a.endIndex - a.startIndex;
    const lenB = b.endIndex - b.startIndex;
    if (lenB !== lenA) return lenB - lenA;
    return a.startIndex - b.startIndex;
  });

  const selected: RawCandidate[] = [];

  for (const candidate of sorted) {
    // Check overlap with already accepted candidates
    const overlaps = selected.some((accepted) => {
      // Two intervals [A, B] and [C, D] overlap if max(A, C) < min(B, D)
      return (
        Math.max(candidate.startIndex, accepted.startIndex) <
        Math.min(candidate.endIndex, accepted.endIndex)
      );
    });

    if (!overlaps) {
      selected.push(candidate);
    }
  }

  return selected;
}
