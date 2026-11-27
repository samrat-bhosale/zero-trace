import { describe, it, expect } from 'vitest';
import { parseCSV, serializeCSV } from '../modules/files/parseCSV';

describe('CSV Parser & Serializer', () => {
  it('parses basic CSV without quotes', () => {
    const csv = `id,name,email,ip
1,Aarav,aarav@example.com,192.168.1.1
2,Rohan,rohan@example.com,10.0.0.1`;

    const parsed = parseCSV(csv);
    expect(parsed.headers).toEqual(['id', 'name', 'email', 'ip']);
    expect(parsed.rows.length).toBe(2);
    expect(parsed.rows[0][2]).toBe('aarav@example.com');
  });

  it('handles quotes containing commas and escaped quotes', () => {
    const csv = `id,notes,amount
1,"Contains, comma and ""quotes""",100.50
2,"Plain notes",250.00`;

    const parsed = parseCSV(csv);
    expect(parsed.rows[0][1]).toBe('Contains, comma and "quotes"');
    expect(parsed.rows[0][2]).toBe('100.50');
  });

  it('handles multiline values inside quotes', () => {
    const csv = `id,comment
1,"Line 1
Line 2
Line 3"
2,Single line`;

    const parsed = parseCSV(csv);
    expect(parsed.rows.length).toBe(2);
    expect(parsed.rows[0][1]).toBe('Line 1\nLine 2\nLine 3');
  });

  it('serializes back to RFC 4180 format with proper quoting', () => {
    const headers = ['name', 'address', 'amount'];
    const rows = [
      ['Aarav Mehta', 'Apartment 4B, MG Road, Mumbai', '10,000'],
      ['Priya Sharma', 'Sector 14', '500'],
    ];

    const serialized = serializeCSV(headers, rows);
    const reParsed = parseCSV(serialized);

    expect(reParsed.rows[0][1]).toBe('Apartment 4B, MG Road, Mumbai');
    expect(reParsed.rows[0][2]).toBe('10,000');
  });
});
