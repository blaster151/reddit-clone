import { NextRequest } from 'next/server';

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