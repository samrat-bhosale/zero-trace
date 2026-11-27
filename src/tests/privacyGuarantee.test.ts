import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { detectEntities } from '../modules/detection/detectEntities';
import { sanitizeText } from '../modules/redaction/redactionEngine';
import { computeDiff } from '../modules/comparison/diffEngine';

describe('Privacy and Security Guarantees', () => {
  it('guarantees that no external telemetry, analytics, or remote API calls exist in source modules', () => {
    const modulesDir = path.resolve(__dirname, '../modules');
    const files = fs.readdirSync(modulesDir, { recursive: true }) as string[];

    const forbiddenTerms = [
      'google-analytics',
      'mixpanel',
      'segment.io',
      'sentry.io',
      'telemetry',
      'api.openai.com',
      'api.anthropic.com',
      'fetch("http',
      "fetch('http",
      'axios.post',
      'http://',
    ];

    for (const f of files) {
      const fullPath = path.join(modulesDir, f);
      if (fs.statSync(fullPath).isFile() && (f.endsWith('.ts') || f.endsWith('.tsx'))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const term of forbiddenTerms) {
          expect(content.toLowerCase()).not.toContain(term.toLowerCase());
        }
      }
    }
  });

  it('handles large documents (1,000+ lines) efficiently without error', () => {
    const lines: string[] = [];
    for (let i = 0; i < 500; i++) {
      lines.push(`Record ${i}: User user${i}@example.com logged in from 192.168.1.${i % 250}`);
    }
    const largeDoc = lines.join('\n');

    const start = performance.now();
    const entities = detectEntities(largeDoc);
    const result = sanitizeText(largeDoc, entities, { globalMode: 'FULL' });
    const diff = computeDiff(largeDoc, result.sanitizedText);
    const duration = performance.now() - start;

    expect(entities.length).toBe(1000); // 500 emails + 500 IPs
    expect(result.redactedCount).toBe(1000);
    expect(diff.changedLinesCount).toBe(500);
    expect(duration).toBeLessThan(1000); // < 1s for 1000 entities
  });
});
