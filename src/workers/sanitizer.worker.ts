import { detectEntities } from '../modules/detection/detectEntities';
import { sanitizeText, RedactionEngineOptions } from '../modules/redaction/redactionEngine';
import { computeDiff } from '../modules/comparison/diffEngine';
import { calculatePrivacyRisk } from '../modules/risk/riskScore';

// Web Worker for off-thread processing of large documents
self.onmessage = (e: MessageEvent) => {
  const { id, type, payload } = e.data;

  try {
    if (type === 'PROCESS_DOCUMENT') {
      const { text, detectionOptions, redactionOptions } = payload;

      const startTime = performance.now();
      const entities = detectEntities(text, detectionOptions);
      const detectionTime = performance.now() - startTime;

      const sanitizeStartTime = performance.now();
      const redactionResult = sanitizeText(text, entities, redactionOptions as RedactionEngineOptions);
      const redactionTime = performance.now() - sanitizeStartTime;

      const diff = computeDiff(text, redactionResult.sanitizedText);
      const risk = calculatePrivacyRisk(entities);

      self.postMessage({
        id,
        success: true,
        data: {
          entities,
          redactionResult,
          diff,
          risk,
          perf: {
            detectionMs: Math.round(detectionTime),
            redactionMs: Math.round(redactionTime),
            totalMs: Math.round(detectionTime + redactionTime),
          },
        },
      });
    }
  } catch (err: unknown) {
    self.postMessage({
      id,
      success: false,
      error: err instanceof Error ? err.message : 'Unknown worker error',
    });
  }
};
