import { describe, it, expect, beforeEach } from 'vitest';

class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

const mockStorage = new LocalStorageMock();

describe('Theme State and Persistence', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  it('defaults to light theme when no storage preference exists', () => {
    const saved = mockStorage.getItem('zero_trace_theme');
    const theme = saved === 'dark' ? 'dark' : 'light';
    expect(theme).toBe('light');
  });

  it('persists dark mode choice in storage', () => {
    let theme: 'light' | 'dark' = 'light';
    const toggle = () => {
      theme = theme === 'light' ? 'dark' : 'light';
      mockStorage.setItem('zero_trace_theme', theme);
    };

    toggle();
    expect(theme).toBe('dark');
    expect(mockStorage.getItem('zero_trace_theme')).toBe('dark');

    toggle();
    expect(theme).toBe('light');
    expect(mockStorage.getItem('zero_trace_theme')).toBe('light');
  });
});
