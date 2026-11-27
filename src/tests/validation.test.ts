import { describe, it, expect } from 'vitest';
import { validateLuhn } from '../modules/detection/luhn';
import { validateAadhaar, validateVerhoeff } from '../modules/detection/aadhaarValidation';
import { validateIPv4, validatePAN, validateEmail, validatePhoneNumber } from '../modules/detection/patterns';

describe('Validation Algorithms', () => {
  describe('Luhn Algorithm', () => {
    it('validates genuine Luhn test cards', () => {
      expect(validateLuhn('4111 1111 1111 1111')).toBe(true);
      expect(validateLuhn('4111111111111111')).toBe(true);
      expect(validateLuhn('4242 4242 4242 4242')).toBe(true);
    });

    it('rejects invalid card numbers', () => {
      expect(validateLuhn('1234 5678 9012 3456')).toBe(false);
      expect(validateLuhn('4111 1111 1111 1112')).toBe(false);
      expect(validateLuhn('0000 0000 0000 0000')).toBe(false); // all repeating zeros rejected
    });
  });

  describe('Aadhaar Validation', () => {
    it('rejects aadhaar starting with 0 or 1', () => {
      expect(validateAadhaar('0123 4567 8901').isValidFormat).toBe(false);
      expect(validateAadhaar('1234 5678 9012').isValidFormat).toBe(false);
    });

    it('accepts valid 12-digit format starting with 2-9', () => {
      const res = validateAadhaar('2345 6789 0123');
      expect(res.isValidFormat).toBe(true);
    });

    it('verifies Verhoeff checksum algorithm', () => {
      // 23637951235 is known valid Verhoeff sequence with check digit
      expect(validateVerhoeff('23637951235')).toBe(true);
      expect(validateVerhoeff('23637951236')).toBe(false);
    });
  });

  describe('IPv4 Validation', () => {
    it('accepts valid IPv4 octets', () => {
      expect(validateIPv4('192.168.1.1')).toBe(true);
      expect(validateIPv4('10.0.0.254')).toBe(true);
      expect(validateIPv4('127.0.0.1')).toBe(true);
    });

    it('rejects invalid octets > 255 or bad format', () => {
      expect(validateIPv4('256.1.1.1')).toBe(false);
      expect(validateIPv4('192.168.1')).toBe(false);
      expect(validateIPv4('192.168.1.1.1')).toBe(false);
      expect(validateIPv4('192.168.01.1')).toBe(false); // leading zero
    });
  });

  describe('PAN Validation', () => {
    it('validates PAN structure and extracts holder type', () => {
      const p1 = validatePAN('ABCCE1234F');
      expect(p1.isValid).toBe(true);
      expect(p1.holderType).toBe('Company'); // C = Company

      const p2 = validatePAN('AAPPA1234A');
      expect(p2.isValid).toBe(true);
      expect(p2.holderType).toBe('Individual'); // P = Individual
    });

    it('rejects invalid PAN format', () => {
      expect(validatePAN('ABCD1234EF').isValid).toBe(false);
      expect(validatePAN('ABCDE12345').isValid).toBe(false);
    });
  });

  describe('Email & Phone Validation', () => {
    it('validates emails correctly', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('first.last+tag@sub.domain.co.uk')).toBe(true);
      expect(validateEmail('not-an-email')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
    });

    it('validates phone numbers', () => {
      expect(validatePhoneNumber('+91 98765 43210').isValid).toBe(true);
      expect(validatePhoneNumber('9876543210').isValid).toBe(true);
      expect(validatePhoneNumber('123').isValid).toBe(false);
      expect(validatePhoneNumber('9999999999').isValid).toBe(false); // all repeating digits
    });
  });
});
