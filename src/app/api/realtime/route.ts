import { NextRequest } from 'next/server';

/**
 * GET /api/realtime
 * 
 * Server-Sent Events (SSE) endpoint for real-time updates on comments and votes.
 * Streams live events to connected clients for real-time functionality.
 * 
 * @param req - NextRequest object (no query parameters currently used)
 * 
 * @example
 * ```typescript
 * // Connect to real-time events
 * const eventSource = new EventSource('/api/realtime');
 * 
 * eventSource.addEventListener('comment', (event) => {
 *   const comment = JSON.parse(event.data);
 *   console.log('New comment:', comment);
 * });
 * 
 * eventSource.addEventListener('vote', (event) => {
 *   const vote = JSON.parse(event.data);
 *   console.log('New vote:', vote);
 * });
 * 
 * // Close connection when done
 * eventSource.close();
 * ```
 * 
 * @returns Response - Server-Sent Events stream with real-time updates
 * 
 * @response
 * Server-Sent Events stream with the following event types:
 * 
 * Comment events:
 * ```
 * event: comment
 * data: {"id":"c2","content":"New comment 2"}
 * ```
 * 
 * Vote events:
 * ```
 * event: vote
 * data: {"id":"v1","targetId":"post-1","voteType":"upvote"}
 * ```
 * 
 * @throws {Error} - If there's an error establishing the SSE connection
 */
export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      let count = 0;
      const interval = setInterval(() => {
        count++;
        const event = count % 2 === 0
          ? { type: 'comment', data: { id: `c${count}`, content: `New comment ${count}` } }
          : { type: 'vote', data: { id: `v${count}`, targetId: 'post-1', voteType: 'upvote' } };
        controller.enqueue(encoder.encode(`event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`));
        if (count >= 3) {
          clearInterval(interval);
          controller.close();
        }
      }, 1000);
    },
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
} 