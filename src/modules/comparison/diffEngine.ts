export type DiffLineType = 'unchanged' | 'modified' | 'added' | 'removed';

export interface DiffSegment {
  type: 'unchanged' | 'removed' | 'added';
  value: string;
}

export interface DiffLine {
  lineNumber: number;
  type: DiffLineType;
  originalText: string;
  sanitizedText: string;
  originalSegments: DiffSegment[];
  sanitizedSegments: DiffSegment[];
  hasChanges: boolean;
}

export interface DiffResult {
  lines: DiffLine[];
  totalLines: number;
  changedLinesCount: number;
  totalRedactionsCount: number;
  totalChangedSegments: number;
}

/**
 * Computes fine-grained word/token diff between original line and sanitized line.
 */
function diffWords(original: string, sanitized: string): {
  originalSegments: DiffSegment[];
  sanitizedSegments: DiffSegment[];
  hasChanges: boolean;
} {
  if (original === sanitized) {
    return {
      originalSegments: [{ type: 'unchanged', value: original }],
      sanitizedSegments: [{ type: 'unchanged', value: sanitized }],
      hasChanges: false,
    };
  }

  // Tokenize by word boundaries, spaces, punctuation
  const tokenRegex = /(\s+|[^\s\w]+|\w+)/g;
  const origTokens = original.match(tokenRegex) || [original];
  const sanitTokens = sanitized.match(tokenRegex) || [sanitized];

  // Simple Longest Common Subsequence (LCS) approach for tokens within a line
  const n = origTokens.length;
  const m = sanitTokens.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (origTokens[i - 1] === sanitTokens[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find LCS
  let i = n;
  let j = m;
  const origSegmentsReversed: DiffSegment[] = [];
  const sanitSegmentsReversed: DiffSegment[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origTokens[i - 1] === sanitTokens[j - 1]) {
      origSegmentsReversed.push({ type: 'unchanged', value: origTokens[i - 1] });
      sanitSegmentsReversed.push({ type: 'unchanged', value: sanitTokens[j - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      sanitSegmentsReversed.push({ type: 'added', value: sanitTokens[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      origSegmentsReversed.push({ type: 'removed', value: origTokens[i - 1] });
      i--;
    }
  }

  // Merge consecutive segments of the same type
  const mergeSegments = (segs: DiffSegment[]): DiffSegment[] => {
    const reversed = [...segs].reverse();
    const result: DiffSegment[] = [];
    for (const seg of reversed) {
      if (result.length > 0 && result[result.length - 1].type === seg.type) {
        result[result.length - 1].value += seg.value;
      } else {
        result.push({ ...seg });
      }
    }
    return result;
  };

  const origMerged = mergeSegments(origSegmentsReversed);
  const sanitMerged = mergeSegments(sanitSegmentsReversed);

  return {
    originalSegments: origMerged,
    sanitizedSegments: sanitMerged,
    hasChanges: true,
  };
}

/**
 * Computes line-by-line diff between original text and sanitized text.
 */
export function computeDiff(originalText: string, sanitizedText: string): DiffResult {
  const origLines = originalText.split('\n');
  const sanitLines = sanitizedText.split('\n');

  const maxLines = Math.max(origLines.length, sanitLines.length);
  const diffLines: DiffLine[] = [];
  let changedLinesCount = 0;
  let totalChangedSegments = 0;

  for (let idx = 0; idx < maxLines; idx++) {
    const orig = origLines[idx] ?? '';
    const sanit = sanitLines[idx] ?? '';

    const wordDiff = diffWords(orig, sanit);
    const lineType: DiffLineType = wordDiff.hasChanges ? 'modified' : 'unchanged';

    if (wordDiff.hasChanges) {
      changedLinesCount++;
      const changedCount =
        wordDiff.originalSegments.filter((s) => s.type === 'removed').length +
        wordDiff.sanitizedSegments.filter((s) => s.type === 'added').length;
      totalChangedSegments += changedCount;
    }

    diffLines.push({
      lineNumber: idx + 1,
      type: lineType,
      originalText: orig,
      sanitizedText: sanit,
      originalSegments: wordDiff.originalSegments,
      sanitizedSegments: wordDiff.sanitizedSegments,
      hasChanges: wordDiff.hasChanges,
    });
  }

  return {
    lines: diffLines,
    totalLines: maxLines,
    changedLinesCount,
    totalRedactionsCount: changedLinesCount,
    totalChangedSegments,
  };
}
