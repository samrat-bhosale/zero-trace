import { ConfidenceLevel, EntityType, ValidationStatus } from './entityTypes';

export interface ConfidenceAssessment {
  level: ConfidenceLevel;
  score: number; // 0.0 - 1.0
  reason: string;
}

/**
 * Calculates transparent confidence based on syntax validation,
 * checksum verification, and contextual keywords.
 */
export function calculateConfidence(
  type: EntityType,
  validationStatus: ValidationStatus,
  text: string,
  startIndex: number,
  _endIndex: number,
  customDetails?: string
): ConfidenceAssessment {
  // Extract preceding 40 characters for contextual signals
  const contextWindow = text.slice(Math.max(0, startIndex - 40), startIndex).toLowerCase();

  let score = 0.5;
  let reason = 'Pattern syntax match';

  switch (type) {
    case 'CREDIT_CARD':
      if (validationStatus === 'VALID') {
        score = 0.95;
        reason = 'Luhn algorithm checksum verified';
        if (contextWindow.includes('card') || contextWindow.includes('payment') || contextWindow.includes('credit') || contextWindow.includes('debit')) {
          score = 0.99;
          reason += ' + payment context';
        }
      } else {
        score = 0.2;
        reason = 'Failed Luhn check (unlikely card)';
      }
      break;

    case 'AADHAAR':
      if (validationStatus === 'VALID') {
        score = 0.95;
        reason = 'UIDAI 12-digit format and Verhoeff checksum verified';
        if (contextWindow.includes('aadhaar') || contextWindow.includes('uidai') || contextWindow.includes('uid')) {
          score = 0.99;
          reason += ' + Aadhaar context';
        }
      } else if (validationStatus === 'SUSPECT') {
        score = 0.75;
        reason = '12-digit spacing matched, Verhoeff checksum not confirmed';
      } else {
        score = 0.3;
        reason = 'Invalid Aadhaar specification';
      }
      break;

    case 'INDIAN_PAN':
      if (validationStatus === 'VALID') {
        score = 0.92;
        reason = 'Standard 10-char PAN format verified with valid entity status';
        if (contextWindow.includes('pan') || contextWindow.includes('tax') || contextWindow.includes('income')) {
          score = 0.98;
          reason += ' + PAN context';
        }
      } else {
        score = 0.25;
        reason = 'Invalid PAN format';
      }
      break;

    case 'EMAIL':
      if (validationStatus === 'VALID') {
        score = 0.94;
        reason = 'RFC 5322 compliant email structure with valid TLD';
        if (contextWindow.includes('email') || contextWindow.includes('mail') || contextWindow.includes('contact')) {
          score = 0.98;
          reason += ' + contact context';
        }
      } else {
        score = 0.4;
        reason = 'Irregular email formatting';
      }
      break;

    case 'IPV4':
    case 'IPV6':
      if (validationStatus === 'VALID') {
        score = 0.92;
        reason = 'All IP octets within 0-255 range';
        if (contextWindow.includes('ip') || contextWindow.includes('host') || contextWindow.includes('server') || contextWindow.includes('login')) {
          score = 0.97;
          reason += ' + network context';
        }
      } else {
        score = 0.1;
        reason = 'Invalid IP address octet';
      }
      break;

    case 'PHONE':
      if (validationStatus === 'VALID') {
        score = 0.85;
        reason = 'Phone format with valid dial code and length';
        if (contextWindow.includes('phone') || contextWindow.includes('call') || contextWindow.includes('mobile') || contextWindow.includes('tel') || contextWindow.includes('contact')) {
          score = 0.95;
          reason += ' + phone context';
        }
      } else {
        score = 0.45;
        reason = 'Uncommon phone number digit structure';
      }
      break;

    case 'API_KEY':
    case 'SECRET_TOKEN':
      score = 0.88;
      reason = customDetails || 'High-entropy secret token pattern match';
      break;

    case 'CUSTOM':
      score = 0.9;
      reason = 'User custom regex pattern match';
      break;

    default:
      score = 0.7;
      reason = 'Standard pattern match';
  }

  let level: ConfidenceLevel = 'MEDIUM';
  if (score >= 0.85) {
    level = 'HIGH';
  } else if (score < 0.5) {
    level = 'LOW';
  }

  return { level, score, reason };
}
