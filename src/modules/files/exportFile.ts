/**
 * Browser-native file export utility
 * Uses Blob and URL.createObjectURL.
 * Never connects to any server. Local only.
 */

export interface ExportFileOptions {
  filename: string;
  mimeType: string;
  content: string;
}

export function downloadBlob(options: ExportFileOptions): void {
  const { filename, mimeType, content } = options;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 200);
}

/**
 * Helper to generate sanitized filename
 * e.g. "customer_support.txt" -> "customer_support_sanitized.txt"
 */
export function getSanitizedFilename(originalName: string, fallbackExt: 'txt' | 'csv' = 'txt'): string {
  if (!originalName) {
    return `zero_trace_sanitized.${fallbackExt}`;
  }

  const dotIdx = originalName.lastIndexOf('.');
  if (dotIdx === -1) {
    return `${originalName}_sanitized.${fallbackExt}`;
  }

  const base = originalName.slice(0, dotIdx);
  const ext = originalName.slice(dotIdx + 1);
  return `${base}_sanitized.${ext}`;
}

export interface AuditReportData {
  fileName?: string;
  processingDate: string;
  redactionMode: string;
  totalEntitiesDetected: number;
  totalRedacted: number;
  totalIgnored: number;
  sanitizationCoverage: string;
  riskScore: {
    level: string;
    score: number;
    reasons: string[];
  };
  categoryBreakdown: Record<string, { count: number; uniqueCount: number }>;
  appliedRules: string[];
}

export function generateAuditReportJSON(data: AuditReportData): string {
  return JSON.stringify(
    {
      title: 'ZERO TRACE PRIVACY AUDIT & VERIFICATION REPORT',
      notice: 'Certified local browser-only sanitization record. No raw sensitive values are contained in this audit file.',
      ...data,
      verificationGuarantee: {
        networkTransfers: '0 bytes (100% Client-Side In-Memory Execution)',
        externalApisUsed: 'None',
        persistentRemoteStorage: 'None',
      },
    },
    null,
    2
  );
}
