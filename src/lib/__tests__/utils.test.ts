import { sanitizeInput } from '../utils';

describe('sanitizeInput', () => {
  it('removes HTML tags', () => {
    expect(sanitizeInput('<b>Hello</b>')).toBe('Hello');
    expect(sanitizeInput('<script>alert(1)</script>')).toBe('alert(1)');
  });

  it('removes javascript: protocol', () => {
    expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
  });

  it('removes event handler attributes', () => {
    expect(sanitizeInput('<div onclick="evil()">Click</div>')).toBe('Click');
    expect(sanitizeInput('onload=evil()')).toBe('evil()');
  });

  it('trims whitespace', () => {
    expect(sanitizeInput('   hello   ')).toBe('hello');
  });

  it('handles empty string', () => {
    expect(sanitizeInput('')).toBe('');
  });
}); 