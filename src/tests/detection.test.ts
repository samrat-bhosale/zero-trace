import { describe, it, expect } from 'vitest';
import { detectEntities } from '../modules/detection/detectEntities';

describe('Entity Detection Engine', () => {
  it('detects standard and repeated emails', () => {
    const text = 'Contact alex@example.com or support@company.org. Again alex@example.com.';
    const entities = detectEntities(text);

    const emails = entities.filter((e) => e.type === 'EMAIL');
    expect(emails.length).toBe(3);
    expect(emails[0].originalValue).toBe('alex@example.com');
    expect(emails[1].originalValue).toBe('support@company.org');
    expect(emails[2].originalValue).toBe('alex@example.com');
    expect(emails[0].validationStatus).toBe('VALID');
  });

  it('detects Indian and international phone numbers', () => {
    const text = 'Indian phone: +91 98765 43210 or 9876543210. US phone: +1 415 555 0132 or (415) 555-0132.';
    const entities = detectEntities(text);

    const phones = entities.filter((e) => e.type === 'PHONE');
    expect(phones.length).toBeGreaterThanOrEqual(3);
    expect(phones.some((p) => p.originalValue.includes('98765 43210'))).toBe(true);
  });

  it('detects IPv4 addresses and ignores invalid octets', () => {
    const text = 'Valid IP: 192.168.1.45 and 10.0.0.1. Invalid IP: 999.300.1.1 or 256.1.1.1.';
    const entities = detectEntities(text);

    const ips = entities.filter((e) => e.type === 'IPV4');
    expect(ips.length).toBe(2);
    expect(ips[0].originalValue).toBe('192.168.1.45');
    expect(ips[1].originalValue).toBe('10.0.0.1');
  });

  it('detects Indian PAN with proper 5-letter 4-digit 1-letter structure', () => {
    const text = 'Customer PAN is ABCDE1234F. Invalid PAN: 12345ABCDE.';
    const entities = detectEntities(text);

    const pans = entities.filter((e) => e.type === 'INDIAN_PAN');
    expect(pans.length).toBe(1);
    expect(pans[0].originalValue).toBe('ABCDE1234F');
    expect(pans[0].normalizedValue).toBe('ABCDE1234F');
  });

  it('detects Aadhaar numbers and verifies format', () => {
    // 12 digits starting with 2-9
    const text = 'Aadhaar: 2345 6789 0123 and another 987654321098. Invalid: 0123 4567 8901 (starts with 0)';
    const entities = detectEntities(text);

    const aadhaars = entities.filter((e) => e.type === 'AADHAAR');
    expect(aadhaars.length).toBe(2);
  });

  it('detects valid Luhn credit cards and strictly rejects invalid ones', () => {
    // 4111 1111 1111 1111 is a known valid Luhn Visa card
    // 1234 5678 9012 3456 fails Luhn
    const text = 'Card: 4111 1111 1111 1111. Invalid card: 1234 5678 9012 3456.';
    const entities = detectEntities(text);

    const cards = entities.filter((e) => e.type === 'CREDIT_CARD');
    expect(cards.length).toBe(1);
    expect(cards[0].originalValue).toBe('4111 1111 1111 1111');
    expect(cards[0].validationStatus).toBe('VALID');
  });

  it('handles empty document and returns empty array', () => {
    expect(detectEntities('')).toEqual([]);
    expect(detectEntities('Normal text with no sensitive info at all.')).toEqual([]);
  });

  it('resolves overlapping entities prioritizing specific verified patterns', () => {
    // A 16 digit card number should not be fragmented into arbitrary phone numbers
    const text = 'Payment Card: 4111 1111 1111 1111';
    const entities = detectEntities(text);

    expect(entities.length).toBe(1);
    expect(entities[0].type).toBe('CREDIT_CARD');
  });
});
