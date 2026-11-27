/**
 * Robust RFC 4180 compliant CSV Parser & Serializer
 * Handles:
 * - Quoted values containing commas, newlines, and double quotes ("")
 * - Empty cells, varied whitespace
 * - Column preservation
 * - Selective column sanitization
 */

export interface ParsedCSV {
  headers: string[];
  rows: string[][];
  rawDelimiter: string;
  hasHeaders: boolean;
  totalRecords: number;
}

/**
 * Detects whether delimiter is comma, tab, or semicolon
 */
export function detectDelimiter(csvText: string): string {
  const firstLine = csvText.split('\n')[0] || '';
  const commaCount = (firstLine.match(/,/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;

  if (tabCount > commaCount && tabCount > semiCount) return '\t';
  if (semiCount > commaCount && semiCount > tabCount) return ';';
  return ',';
}

/**
 * Parses a CSV string into headers and rows with full quote and newline support.
 */
export function parseCSV(csvText: string, delimiter?: string): ParsedCSV {
  if (!csvText || typeof csvText !== 'string') {
    return {
      headers: [],
      rows: [],
      rawDelimiter: ',',
      hasHeaders: false,
      totalRecords: 0,
    };
  }

  const delim = delimiter || detectDelimiter(csvText);
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;
  let i = 0;

  while (i < csvText.length) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote: "" inside quotes becomes "
        currentCell += '"';
        i += 2;
        continue;
      } else {
        // Toggle quotes
        insideQuotes = !insideQuotes;
        i++;
        continue;
      }
    }

    if (!insideQuotes && char === delim) {
      // Cell boundary
      currentRow.push(currentCell);
      currentCell = '';
      i++;
      continue;
    }

    if (!insideQuotes && (char === '\r' || char === '\n')) {
      // Handle CRLF or LF
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = '';
      i++;
      continue;
    }

    // Normal character (including commas or newlines when inside quotes)
    currentCell += char;
    i++;
  }

  // Push trailing cell & row if any
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  if (rows.length === 0) {
    return {
      headers: [],
      rows: [],
      rawDelimiter: delim,
      hasHeaders: false,
      totalRecords: 0,
    };
  }

  const headers = rows[0] || [];
  const dataRows = rows.slice(1);

  return {
    headers,
    rows: dataRows,
    rawDelimiter: delim,
    hasHeaders: true,
    totalRecords: dataRows.length,
  };
}

/**
 * Serializes parsed headers and rows back into RFC 4180 CSV format.
 */
export function serializeCSV(headers: string[], rows: string[][], delimiter: string = ','): string {
  const escapeCell = (cell: string): string => {
    if (cell === null || cell === undefined) return '';
    const str = String(cell);
    if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = headers.map(escapeCell).join(delimiter);
  const rowLines = rows.map((row) => row.map(escapeCell).join(delimiter));

  return [headerLine, ...rowLines].join('\n');
}
