import { formatDate, formatRelativeTime } from '../utils';

describe('formatDate', () => {
  it('formats current date correctly', () => {
    const now = new Date();
    const formatted = formatDate(now);
    
    // Should return a string in a readable format
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('formats past date correctly', () => {
    const pastDate = new Date('2024-01-15T10:30:00Z');
    const formatted = formatDate(pastDate);
    
    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('2024');
  });

  it('formats future date correctly', () => {
    const futureDate = new Date('2025-12-25T15:45:00Z');
    const formatted = formatDate(futureDate);
    
    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('2025');
  });

  it('handles date with timezone information', () => {
    const dateWithTz = new Date('2024-06-15T14:30:00.000Z');
    const formatted = formatDate(dateWithTz);
    
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('handles date string input by converting to Date', () => {
    const dateString = '2024-03-20T09:15:00Z';
    const dateObj = new Date(dateString);
    const formatted = formatDate(dateObj);
    
    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('2024');
  });

  it('handles timestamp input by converting to Date', () => {
    const timestamp = 1703123456789; // Some timestamp
    const dateObj = new Date(timestamp);
    const formatted = formatDate(dateObj);
    
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('handles invalid date gracefully', () => {
    const invalidDate = new Date('invalid-date');
    const formatted = formatDate(invalidDate);
    
    // Should return a fallback or error message
    expect(typeof formatted).toBe('string');
  });

  it('handles null input gracefully', () => {
    const formatted = formatDate(null as any);
    
    expect(typeof formatted).toBe('string');
  });

  it('handles undefined input gracefully', () => {
    const formatted = formatDate(undefined as any);
    
    expect(typeof formatted).toBe('string');
  });

  it('formats dates from different years', () => {
    const oldDate = new Date('1995-05-15T12:00:00Z');
    const recentDate = new Date('2023-08-20T16:30:00Z');
    
    const oldFormatted = formatDate(oldDate);
    const recentFormatted = formatDate(recentDate);
    
    expect(oldFormatted).toContain('1995');
    expect(recentFormatted).toContain('2023');
  });

  it('handles edge case dates', () => {
    const epochDate = new Date(0); // Unix epoch
    const farFutureDate = new Date('2100-01-01T00:00:00Z');
    
    const epochFormatted = formatDate(epochDate);
    const futureFormatted = formatDate(farFutureDate);
    
    expect(typeof epochFormatted).toBe('string');
    expect(typeof futureFormatted).toBe('string');
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    // Mock current time to ensure consistent tests
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('formats time just now', () => {
    const justNow = new Date('2024-01-15T11:59:30Z');
    const formatted = formatRelativeTime(justNow);
    
    expect(formatted).toMatch(/just now|seconds? ago|a moment ago/i);
  });

  it('formats time in minutes', () => {
    const fiveMinutesAgo = new Date('2024-01-15T11:55:00Z');
    const formatted = formatRelativeTime(fiveMinutesAgo);
    
    expect(formatted).toMatch(/5 minutes? ago|5m ago/i);
  });

  it('formats time in hours', () => {
    const twoHoursAgo = new Date('2024-01-15T10:00:00Z');
    const formatted = formatRelativeTime(twoHoursAgo);
    
    expect(formatted).toMatch(/2 hours? ago|2h ago/i);
  });

  it('formats time in days', () => {
    const threeDaysAgo = new Date('2024-01-12T12:00:00Z');
    const formatted = formatRelativeTime(threeDaysAgo);
    
    expect(formatted).toMatch(/3 days? ago|3d ago/i);
  });

  it('formats time in weeks', () => {
    const twoWeeksAgo = new Date('2024-01-01T12:00:00Z');
    const formatted = formatRelativeTime(twoWeeksAgo);
    
    expect(formatted).toMatch(/2 weeks? ago|2w ago/i);
  });

  it('formats time in months', () => {
    const threeMonthsAgo = new Date('2023-10-15T12:00:00Z');
    const formatted = formatRelativeTime(threeMonthsAgo);
    
    expect(formatted).toMatch(/3 months? ago|3mo ago/i);
  });

  it('formats time in years', () => {
    const twoYearsAgo = new Date('2022-01-15T12:00:00Z');
    const formatted = formatRelativeTime(twoYearsAgo);
    
    expect(formatted).toMatch(/2 years? ago|2y ago/i);
  });

  it('handles future dates', () => {
    const fiveMinutesFromNow = new Date('2024-01-15T12:05:00Z');
    const formatted = formatRelativeTime(fiveMinutesFromNow);
    
    expect(formatted).toMatch(/in 5 minutes?|5m from now/i);
  });

  it('handles far future dates', () => {
    const oneYearFromNow = new Date('2025-01-15T12:00:00Z');
    const formatted = formatRelativeTime(oneYearFromNow);
    
    expect(formatted).toMatch(/in 1 year|1y from now/i);
  });

  it('handles edge case of exactly one unit', () => {
    const oneMinuteAgo = new Date('2024-01-15T11:59:00Z');
    const oneHourAgo = new Date('2024-01-15T11:00:00Z');
    const oneDayAgo = new Date('2024-01-14T12:00:00Z');
    
    const minuteFormatted = formatRelativeTime(oneMinuteAgo);
    const hourFormatted = formatRelativeTime(oneHourAgo);
    const dayFormatted = formatRelativeTime(oneDayAgo);
    
    expect(minuteFormatted).toMatch(/1 minute ago|1m ago/i);
    expect(hourFormatted).toMatch(/1 hour ago|1h ago/i);
    expect(dayFormatted).toMatch(/1 day ago|1d ago/i);
  });

  it('handles very recent times (less than a minute)', () => {
    const thirtySecondsAgo = new Date('2024-01-15T11:59:30Z');
    const formatted = formatRelativeTime(thirtySecondsAgo);
    
    expect(formatted).toMatch(/just now|seconds? ago|a moment ago/i);
  });

  it('handles very old dates', () => {
    const tenYearsAgo = new Date('2014-01-15T12:00:00Z');
    const formatted = formatRelativeTime(tenYearsAgo);
    
    expect(formatted).toMatch(/10 years? ago|10y ago/i);
  });

  it('handles invalid date input', () => {
    const invalidDate = new Date('invalid-date');
    const formatted = formatRelativeTime(invalidDate);
    
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('handles null input', () => {
    const formatted = formatRelativeTime(null as any);
    
    expect(typeof formatted).toBe('string');
  });

  it('handles undefined input', () => {
    const formatted = formatRelativeTime(undefined as any);
    
    expect(typeof formatted).toBe('string');
  });

  it('handles string date input by converting to Date', () => {
    const dateString = '2024-01-15T11:00:00Z';
    const dateObj = new Date(dateString);
    const formatted = formatRelativeTime(dateObj);
    
    expect(formatted).toMatch(/1 hour ago|1h ago/i);
  });

  it('handles timestamp input by converting to Date', () => {
    const timestamp = new Date('2024-01-15T11:00:00Z').getTime();
    const dateObj = new Date(timestamp);
    const formatted = formatRelativeTime(dateObj);
    
    expect(formatted).toMatch(/1 hour ago|1h ago/i);
  });

  it('handles edge case of exactly 24 hours', () => {
    const exactly24HoursAgo = new Date('2024-01-14T12:00:00Z');
    const formatted = formatRelativeTime(exactly24HoursAgo);
    
    expect(formatted).toMatch(/1 day ago|1d ago/i);
  });

  it('handles edge case of exactly 7 days', () => {
    const exactly7DaysAgo = new Date('2024-01-08T12:00:00Z');
    const formatted = formatRelativeTime(exactly7DaysAgo);
    
    expect(formatted).toMatch(/1 week ago|1w ago/i);
  });

  it('handles edge case of exactly 30 days', () => {
    const exactly30DaysAgo = new Date('2023-12-16T12:00:00Z');
    const formatted = formatRelativeTime(exactly30DaysAgo);
    
    expect(formatted).toMatch(/1 month ago|1mo ago/i);
  });
}); 