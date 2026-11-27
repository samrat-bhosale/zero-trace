/**
 * Validation for IPv4 and IPv6
 */
export function validateIPv4(candidate: string): boolean {
  const parts = candidate.split('.');
  if (parts.length !== 4) return false;

  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return false;
    const num = parseInt(part, 10);
    if (num < 0 || num > 255) return false;
    // Check leading zeros (e.g., 01 is usually invalid unless single 0)
    if (part.length > 1 && part.startsWith('0')) return false;
  }
  return true;
}

export function validateIPv6(candidate: string): boolean {
  // Regex for standard IPv6 address format
  const ipv6Pattern = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
  return ipv6Pattern.test(candidate);
}

/**
 * Indian PAN Validation:
 * Format: ABCDE1234F
 * 5 letters, 4 digits, 1 letter.
 * 4th character represents holder status:
 *   P = Individual
 *   C = Company
 *   H = Hindu Undivided Family (HUF)
 *   A = Association of Persons (AOP)
 *   B = Body of Individuals (BOI)
 *   G = Government Agency
 *   J = Artificial Juridical Person
 *   L = Local Authority
 *   F = Firm / Limited Liability Partnership
 *   T = Trust
 */
export function validatePAN(pan: string): { isValid: boolean; holderType?: string } {
  const clean = pan.trim().toUpperCase();
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

  if (!panRegex.test(clean)) {
    return { isValid: false };
  }

  const holderChar = clean.charAt(3);
  const holderMap: Record<string, string> = {
    P: 'Individual',
    C: 'Company',
    H: 'HUF',
    A: 'AOP',
    B: 'BOI',
    G: 'Government',
    J: 'Juridical Person',
    L: 'Local Authority',
    F: 'Firm/LLP',
    T: 'Trust',
  };

  const holderType = holderMap[holderChar] || 'Entity';
  return { isValid: true, holderType };
}

/**
 * Phone number validation and normalization
 */
export function validatePhoneNumber(phone: string): { isValid: boolean; normalized: string; countryCode?: string } {
  // Strip whitespace, hyphens, brackets
  const digitsOnly = phone.replace(/\D/g, '');

  // Must have at least 7 digits (local) and max 15 digits (E.164 standard)
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return { isValid: false, normalized: phone };
  }

  // Reject repeated numbers like 9999999999 or 0000000000
  if (/^(\d)\1+$/.test(digitsOnly)) {
    return { isValid: false, normalized: phone };
  }

  // Indian format check
  if (phone.includes('+91') || (digitsOnly.length === 10 && /^[6-9]/.test(digitsOnly)) || (digitsOnly.length === 12 && digitsOnly.startsWith('91'))) {
    return {
      isValid: true,
      normalized: digitsOnly.length === 12 ? `+${digitsOnly}` : digitsOnly.length === 10 ? `+91${digitsOnly}` : digitsOnly,
      countryCode: 'IN',
    };
  }

  // US/International
  if (phone.includes('+1') || (digitsOnly.length === 11 && digitsOnly.startsWith('1'))) {
    return {
      isValid: true,
      normalized: `+${digitsOnly}`,
      countryCode: 'US/CA',
    };
  }

  return {
    isValid: true,
    normalized: digitsOnly,
  };
}

/**
 * Email validation according to RFC 5322 subset
 */
export function validateEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  // Proper regex that avoids trailing punctuation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email);
}
