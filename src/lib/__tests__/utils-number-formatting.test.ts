import { formatNumber } from '../utils';

describe('formatNumber', () => {
  it('formats numbers less than 1000 correctly', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(1)).toBe('1');
    expect(formatNumber(42)).toBe('42');
    expect(formatNumber(999)).toBe('999');
  });

  it('formats numbers in thousands correctly', () => {
    expect(formatNumber(1000)).toBe('1.0K');
    expect(formatNumber(1500)).toBe('1.5K');
    expect(formatNumber(9999)).toBe('10.0K');
    expect(formatNumber(12345)).toBe('12.3K');
    expect(formatNumber(999999)).toBe('1000.0K');
  });

  it('formats numbers in millions correctly', () => {
    expect(formatNumber(1000000)).toBe('1.0M');
    expect(formatNumber(1500000)).toBe('1.5M');
    expect(formatNumber(12345678)).toBe('12.3M');
    expect(formatNumber(999999999)).toBe('1000.0M');
  });

  it('handles zero correctly', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('handles negative numbers correctly', () => {
    expect(formatNumber(-1)).toBe('-1');
    expect(formatNumber(-1000)).toBe('-1.0K');
    expect(formatNumber(-1500000)).toBe('-1.5M');
  });

  it('handles decimal numbers correctly', () => {
    expect(formatNumber(1.5)).toBe('1.5');
    expect(formatNumber(1500.7)).toBe('1.5K');
    expect(formatNumber(1500000.8)).toBe('1.5M');
  });

  it('handles very large numbers', () => {
    expect(formatNumber(1000000000)).toBe('1000.0M');
    expect(formatNumber(999999999999)).toBe('1000000.0M');
  });

  it('handles edge cases around thresholds', () => {
    // Just below 1000
    expect(formatNumber(999)).toBe('999');
    
    // Exactly 1000
    expect(formatNumber(1000)).toBe('1.0K');
    
    // Just above 1000
    expect(formatNumber(1001)).toBe('1.0K');
    
    // Just below 1M
    expect(formatNumber(999999)).toBe('1000.0K');
    
    // Exactly 1M
    expect(formatNumber(1000000)).toBe('1.0M');
    
    // Just above 1M
    expect(formatNumber(1000001)).toBe('1.0M');
  });

  it('handles numbers with trailing zeros in decimal places', () => {
    expect(formatNumber(1000)).toBe('1.0K');
    expect(formatNumber(2000)).toBe('2.0K');
    expect(formatNumber(1000000)).toBe('1.0M');
    expect(formatNumber(2000000)).toBe('2.0M');
  });

  it('handles numbers that round up correctly', () => {
    expect(formatNumber(1499)).toBe('1.5K');
    expect(formatNumber(1499999)).toBe('1.5M');
  });

  it('handles numbers that round down correctly', () => {
    expect(formatNumber(1400)).toBe('1.4K');
    expect(formatNumber(1400000)).toBe('1.4M');
  });

  it('handles very small decimal numbers', () => {
    expect(formatNumber(0.1)).toBe('0.1');
    expect(formatNumber(0.01)).toBe('0.01');
    expect(formatNumber(0.001)).toBe('0.001');
  });

  it('handles numbers with many decimal places', () => {
    expect(formatNumber(1234.5678)).toBe('1.2K');
    expect(formatNumber(1234567.89)).toBe('1.2M');
  });

  it('handles Infinity and -Infinity', () => {
    expect(formatNumber(Infinity)).toBe('Infinity');
    expect(formatNumber(-Infinity)).toBe('-Infinity');
  });

  it('handles NaN', () => {
    expect(formatNumber(NaN)).toBe('NaN');
  });

  it('handles very small numbers that should still show as is', () => {
    expect(formatNumber(0.0001)).toBe('0.0001');
    expect(formatNumber(0.00001)).toBe('0.00001');
  });

  it('handles numbers that are exactly at the boundary', () => {
    // Test exact boundaries
    expect(formatNumber(999)).toBe('999');
    expect(formatNumber(1000)).toBe('1.0K');
    expect(formatNumber(999999)).toBe('1000.0K');
    expect(formatNumber(1000000)).toBe('1.0M');
  });

  it('handles numbers with different precision requirements', () => {
    // Numbers that should show one decimal place
    expect(formatNumber(1500)).toBe('1.5K');
    expect(formatNumber(2500)).toBe('2.5K');
    
    // Numbers that should show no decimal place (when it would be .0)
    expect(formatNumber(1000)).toBe('1.0K');
    expect(formatNumber(2000)).toBe('2.0K');
  });

  it('handles edge cases with negative numbers around thresholds', () => {
    expect(formatNumber(-999)).toBe('-999');
    expect(formatNumber(-1000)).toBe('-1.0K');
    expect(formatNumber(-999999)).toBe('-1000.0K');
    expect(formatNumber(-1000000)).toBe('-1.0M');
  });

  it('handles numbers that are powers of 10', () => {
    expect(formatNumber(10)).toBe('10');
    expect(formatNumber(100)).toBe('100');
    expect(formatNumber(1000)).toBe('1.0K');
    expect(formatNumber(10000)).toBe('10.0K');
    expect(formatNumber(100000)).toBe('100.0K');
    expect(formatNumber(1000000)).toBe('1.0M');
  });

  it('handles numbers with scientific notation input', () => {
    // These would be converted to regular numbers by JavaScript
    expect(formatNumber(1e3)).toBe('1.0K');
    expect(formatNumber(1.5e6)).toBe('1.5M');
    expect(formatNumber(1e-3)).toBe('0.001');
  });
}); 