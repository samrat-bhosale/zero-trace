/**
 * Aadhaar validation implementation:
 * - 12 digits
 * - Does not start with 0 or 1 (UIDAI specifications: Aadhaar numbers start with 2-9)
 * - Cannot be all identical digits
 * - Verhoeff algorithm checksum verification
 */

// The multiplication table (d)
const d: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

// The permutation table (p)
const p: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

/**
 * Validates a number using the Verhoeff algorithm.
 */
export function validateVerhoeff(numStr: string): boolean {
  let c = 0;
  const digits = numStr.split('').map(Number).reverse();

  for (let i = 0; i < digits.length; i++) {
    c = d[c][p[i % 8][digits[i]]];
  }

  return c === 0;
}

export interface AadhaarValidationResult {
  isValidFormat: boolean;
  passesVerhoeff: boolean;
  reason?: string;
}

/**
 * Validates 12-digit Indian Aadhaar format and checksum.
 * Note: Never claims a format match confirms the number belongs to a real Aadhaar holder.
 */
export function validateAadhaar(raw: string): AadhaarValidationResult {
  const digits = raw.replace(/\D/g, '');

  if (digits.length !== 12) {
    return { isValidFormat: false, passesVerhoeff: false, reason: 'Must be exactly 12 digits' };
  }

  // Aadhaar cannot start with 0 or 1
  if (digits.startsWith('0') || digits.startsWith('1')) {
    return {
      isValidFormat: false,
      passesVerhoeff: false,
      reason: 'Valid Aadhaar does not start with 0 or 1',
    };
  }

  // Cannot be all repeating numbers (e.g. 2222 2222 2222)
  if (/^(\d)\1{11}$/.test(digits)) {
    return {
      isValidFormat: false,
      passesVerhoeff: false,
      reason: 'Repeated identical digits',
    };
  }

  const verhoeffValid = validateVerhoeff(digits);

  return {
    isValidFormat: true,
    passesVerhoeff: verhoeffValid,
    reason: verhoeffValid ? 'Valid format & Verhoeff checksum' : 'Format matched but Verhoeff checksum failed',
  };
}
