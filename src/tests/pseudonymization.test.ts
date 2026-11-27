import { describe, it, expect } from 'vitest';
import { detectEntities } from '../modules/detection/detectEntities';
import { sanitizeText } from '../modules/redaction/redactionEngine';
import { PseudonymEngine } from '../modules/redaction/pseudonymize';

describe('Pseudonymization Consistency', () => {
  it('maps repeated emails to identical pseudonyms with USER_01 convention', () => {
    const text = `Customer Aarav: aarav.mehta@example.com
Secondary: aarav.mehta@example.com
Support Rep: support@example.com
Third mention: aarav.mehta@example.com`;

    const entities = detectEntities(text);
    const result = sanitizeText(text, entities, {
      globalMode: 'PSEUDONYMIZE',
    });

    // aarav.mehta should always be USER_01
    // support@example.com should be USER_02
    expect(result.sanitizedText).toBe(`Customer Aarav: USER_01
Secondary: USER_01
Support Rep: USER_02
Third mention: USER_01`);
  });

  it('normalizes email case so identical emails with different casing get the same pseudonym', () => {
    const text = 'Emails: Alex@Example.COM and alex@example.com';
    const entities = detectEntities(text);
    const result = sanitizeText(text, entities, {
      globalMode: 'PSEUDONYMIZE',
    });

    expect(result.sanitizedText).toBe('Emails: USER_01 and USER_01');
  });

  it('maintains separate numbering by entity category', () => {
    const text = `Email: test@example.com
Phone: +91 98765 43210
PAN: ABCDE1234F
Aadhaar: 2345 6789 0123
IP: 192.168.1.45`;

    const entities = detectEntities(text);
    const result = sanitizeText(text, entities, {
      globalMode: 'PSEUDONYMIZE',
    });

    expect(result.sanitizedText).toContain('USER_01');
    expect(result.sanitizedText).toContain('PHONE_01');
    expect(result.sanitizedText).toContain('PAN_01');
    expect(result.sanitizedText).toContain('AADHAAR_01');
    expect(result.sanitizedText).toContain('IP_01');
  });

  it('generates exportable mapping file', () => {
    const engine = new PseudonymEngine();
    engine.getPseudonym('EMAIL', 'aarav@example.com', 'aarav@example.com', 0);
    engine.getPseudonym('PHONE', '+91 98765 43210', '+919876543210', 50);

    const jsonStr = engine.exportMappingJSON();
    const parsed = JSON.parse(jsonStr);

    expect(parsed.totalEntitiesMapped).toBe(2);
    expect(parsed.mappings[0].pseudonym).toBe('USER_01');
    expect(parsed.mappings[1].pseudonym).toBe('PHONE_01');
  });
});
