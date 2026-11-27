import { describe, it, expect } from 'vitest';
import { detectEntities } from '../modules/detection/detectEntities';
import { sanitizeText } from '../modules/redaction/redactionEngine';
import { getFullMask } from '../modules/redaction/fullMask';
import { getPartialMask } from '../modules/redaction/partialMask';

describe('Redaction Engine', () => {
  const sample = 'User email: aarav.mehta@example.com, Phone: +91 98765 43210, PAN: ABCDE1234F.';

  it('performs full masking with default and custom replacement labels', () => {
    const entities = detectEntities(sample);
    const result = sanitizeText(sample, entities, {
      globalMode: 'FULL',
    });

    expect(result.sanitizedText).toContain('[EMAIL REDACTED]');
    expect(result.sanitizedText).toContain('[PHONE REDACTED]');
    expect(result.sanitizedText).toContain('[PAN REDACTED]');
    expect(result.sanitizedText).not.toContain('aarav.mehta@example.com');
    expect(result.sanitizedText).not.toContain('+91 98765 43210');
    expect(result.sanitizedText).not.toContain('ABCDE1234F');
    expect(result.sanitizationPercentage).toBe(100);
  });

  it('performs partial masking keeping safe verification context', () => {
    const emailPartial = getPartialMask('EMAIL', 'aarav.mehta@example.com');
    expect(emailPartial).toBe('a***@example.com');

    const phonePartial = getPartialMask('PHONE', '+91 98765 43210');
    expect(phonePartial).toContain('3210');

    const panPartial = getPartialMask('INDIAN_PAN', 'ABCDE1234F');
    expect(panPartial).toBe('AB***1234F');

    const cardPartial = getPartialMask('CREDIT_CARD', '4111 1111 1111 1111');
    expect(cardPartial).toBe('XXXX XXXX XXXX 1111');
  });

  it('respects ignored entities', () => {
    const entities = detectEntities(sample);
    const emailEntity = entities.find((e) => e.type === 'EMAIL')!;

    const result = sanitizeText(sample, entities, {
      globalMode: 'FULL',
      ignoredEntityIds: new Set([emailEntity.id]),
    });

    // Email should remain untouched
    expect(result.sanitizedText).toContain('aarav.mehta@example.com');
    // Others should be redacted
    expect(result.sanitizedText).toContain('[PHONE REDACTED]');
    expect(result.ignoredCount).toBe(1);
    expect(result.redactedCount).toBe(entities.length - 1);
  });

  it('preserves surrounding text and formatting', () => {
    const multiline = `Header
Email: user@test.com
Footer note.`;
    const entities = detectEntities(multiline);
    const res = sanitizeText(multiline, entities, { globalMode: 'FULL' });

    expect(res.sanitizedText).toBe(`Header
Email: [EMAIL REDACTED]
Footer note.`);
  });
});
