/**
 * Luhn algorithm implementation (Mod 10 formula)
 * Used to validate credit card numbers, debit cards, and IMEI numbers.
 */
export function validateLuhn(value: string): boolean {
  // Strip non-digit characters
  const sanitized = value.replace(/\D/g, '');

  // Must be between 13 and 19 digits for credit/debit cards
  if (sanitized.length < 13 || sanitized.length > 19) {
    return false;
  }

  // Reject all repeated digits like 0000000000000000
  if (/^(\d)\1+$/.test(sanitized)) {
    return false;
  }

  let sum = 0;
  let alternate = false;

  // Process digits from right to left
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);

    if (alternate) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    alternate = !alternate;
  }

  return sum % 10 === 0;
}

export function detectCardBrand(digits: string): string {
  const clean = digits.replace(/\D/g, '');
  if (/^4/.test(clean)) return 'Visa';
  if (/^(5[1-5]|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)/.test(clean)) return 'Mastercard';
  if (/^3[47]/.test(clean)) return 'American Express';
  if (/^6011|65|64[4-9]|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[01][0-9]|92[0-5])/.test(clean)) return 'Discover';
  if (/^35(2[89]|[3-8][0-9])/.test(clean)) return 'JCB';
  if (/^(5018|5020|5038|6304|6759|6761|6763)/.test(clean)) return 'Maestro';
  if (/^60|6521|6522/.test(clean)) return 'RuPay';
  return 'Payment Card';
}
