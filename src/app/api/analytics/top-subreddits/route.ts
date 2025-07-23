import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/analytics/top-subreddits
 * 
 * Retrieves top subreddits based on subscriber count and activity metrics.
 * In a real application, this would aggregate data from database analytics.
 * 
 * @param req - NextRequest object (no query parameters currently used)
 * 
 * @example
 * ```typescript
 * // Get top subreddits
 * const response = await fetch('/api/analytics/top-subreddits');
 * const data = await response.json();
 * ```
 * 
 * @returns Promise<NextResponse> - JSON response with top subreddits data
 * 
 * @response
 * ```json
 * {
 *   "topSubreddits": [
 *     {
 *       "id": "sub-1",
 *       "name": "programming",
 *       "subscriberCount": 10000
 *     },
 *     {
 *       "id": "sub-2",
 *       "name": "javascript",
 *       "subscriberCount": 8000
 *     }
 *   ]
 * }
 * ```
 * 
 * @throws {Error} - If there's an error retrieving top subreddits
 */
export async function GET(req: NextRequest) {
  // In a real app, calculate top subreddits from DB
  const topSubreddits = [
    { id: 'sub-1', name: 'programming', subscriberCount: 10000 },
    { id: 'sub-2', name: 'javascript', subscriberCount: 8000 },
  ];
  return NextResponse.json({ topSubreddits }, { status: 200 });
} 