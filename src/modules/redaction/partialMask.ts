import { EntityType } from '../detection/entityTypes';

export type PartialMaskPreset = 'conservative' | 'balanced' | 'minimal';

export interface PartialMaskOptions {
  preset?: PartialMaskPreset;
}

/**
 * Generates an entity-specific partial mask that keeps safe context for verification
 * without exposing the entire sensitive identifier.
 */
export function getPartialMask(
  type: EntityType,
  originalValue: string,
  options?: PartialMaskOptions
): string {
  const preset = options?.preset || 'balanced';

  switch (type) {
    case 'EMAIL': {
      const atIdx = originalValue.indexOf('@');
      if (atIdx <= 0) return '[EMAIL REDACTED]';

      const localPart = originalValue.slice(0, atIdx);
      const domainPart = originalValue.slice(atIdx);

      if (preset === 'minimal') {
        // Minimal: reveal first letter and domain
        return `${localPart[0]}***${domainPart}`;
      } else if (preset === 'conservative') {
        // Conservative: hide even more of the domain
        const domainParts = domainPart.split('.');
        const tld = domainParts.length > 1 ? `.${domainParts[domainParts.length - 1]}` : '';
        return `${localPart[0]}***@***${tld}`;
      } else {
        // Balanced: a***@example.com
        return `${localPart[0]}***${domainPart}`;
      }
    }

    case 'PHONE': {
      const digits = originalValue.replace(/\D/g, '');
      if (digits.length < 4) return '[PHONE REDACTED]';

      const last4 = digits.slice(-4);
      if (preset === 'minimal') {
        // XXXXXX3210
        return 'X'.repeat(Math.max(4, digits.length - 4)) + last4;
      } else if (preset === 'conservative') {
        // XX...XX210 (only last 3)
        const last3 = digits.slice(-3);
        return 'X'.repeat(Math.max(5, digits.length - 3)) + last3;
      } else {
        // Balanced: XXXXXX3210
        return 'X'.repeat(Math.max(4, digits.length - 4)) + last4;
      }
    }

    case 'CREDIT_CARD': {
      const digits = originalValue.replace(/\D/g, '');
      if (digits.length < 4) return '[CARD REDACTED]';

      const last4 = digits.slice(-4);
      if (preset === 'minimal') {
        // First 4 and last 4: 4111 XXXX XXXX 1111
        const first4 = digits.slice(0, 4);
        return `${first4} XXXX XXXX ${last4}`;
      } else {
        // Balanced & Conservative: XXXX XXXX XXXX 1234
        return `XXXX XXXX XXXX ${last4}`;
      }
    }

    case 'AADHAAR': {
      const digits = originalValue.replace(/\D/g, '');
      if (digits.length < 4) return '[AADHAAR REDACTED]';
      const last4 = digits.slice(-4);
      return `XXXX XXXX ${last4}`;
    }

    case 'INDIAN_PAN': {
      const pan = originalValue.trim().toUpperCase();
      if (pan.length !== 10) return '[PAN REDACTED]';
      if (preset === 'conservative') {
        // XXXXX1234X
        return `XXXXX${pan.slice(5, 9)}X`;
      } else {
        // AB***1234F
        return `${pan.slice(0, 2)}***${pan.slice(5, 9)}${pan.slice(9)}`;
      }
    }

    case 'IPV4': {
      const parts = originalValue.split('.');
      if (parts.length !== 4) return '[IP REDACTED]';
      if (preset === 'minimal') {
        // 192.168.1.XXX
        return `${parts[0]}.${parts[1]}.${parts[2]}.XXX`;
      } else {
        // 192.168.XXX.XXX
        return `${parts[0]}.${parts[1]}.XXX.XXX`;
      }
    }

    case 'IPV6': {
      const parts = originalValue.split(':');
      if (parts.length < 3) return '[IPV6 REDACTED]';
      return `${parts[0]}:${parts[1]}:XXXX:XXXX:XXXX`;
    }

    case 'API_KEY':
    case 'SECRET_TOKEN': {
      if (originalValue.length <= 8) return '[SECRET REDACTED]';
      const prefix = originalValue.slice(0, 4);
      return `${prefix}****************`;
    }

    case 'DATE_OF_BIRTH': {
      // Keep year, mask day/month: **/**/1990
      const parts = originalValue.split(/[-/]/);
      if (parts.length === 3) {
        const year = parts[2].length === 4 ? parts[2] : parts[0].length === 4 ? parts[0] : 'XXXX';
        return `**/**/${year}`;
      }
      return '**/**/****';
    }

    default:
      return '[REDACTED]';
  }
}
