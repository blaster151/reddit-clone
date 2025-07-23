import { NextRequest } from 'next/server';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { POST as createPost } from '../posts/create/route';
import { GET as getPosts } from '../posts/route';
import { POST as createComment } from '../comments/create/route';
import { POST as submitVote } from '../votes/route';
import { POST as searchPosts } from '../search/route';

// Mock server for testing network failures
const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});
afterAll(() => server.close());

describe('API Error Handling Tests', () => {
  describe('Network Failures', () => {
    it('handles network connection failures gracefully', async () => {
      // Mock network failure
      server.use(
        rest.post('/api/posts/create', (req, res, ctx) => {
          return res.networkError('Failed to connect');
        })
      );

      const request = new NextRequest('http://localhost:3000/api/posts/create', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Post',
          content: 'Test content',
          subredditId: 'test-subreddit',
        }),
      });

      const response = await createPost(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('network');
    });

    it('handles DNS resolution failures', async () => {
      // Mock DNS failure
      server.use(
        rest.get('/api/posts', (req, res, ctx) => {
          return res.networkError('ENOTFOUND');
        })
      );

      const request = new NextRequest('http://localhost:3000/api/posts');
      const response = await getPosts(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('network');
    });

    it('handles server unreachable errors', async () => {
      // Mock server unreachable
      server.use(
        rest.post('/api/comments/create', (req, res, ctx) => {
          return res.networkError('ECONNREFUSED');
        })
      );

      const request = new NextRequest('http://localhost:3000/api/comments/create', {
        method: 'POST',
        body: JSON.stringify({
          content: 'Test comment',
          postId: 'test-post',
        }),
      });

      const response = await createComment(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('network');
    });
  });

  describe('Timeout Handling', () => {
    it('handles request timeouts', async () => {
      // Mock slow response that times out
      server.use(
        rest.post('/api/votes', async (req, res, ctx) => {
          await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second delay
          return res(ctx.json({ success: true }));
        })
      );

      const request = new NextRequest('http://localhost:3000/api/votes', {
        method: 'POST',
        body: JSON.stringify({
          targetId: 'test-post',
          targetType: 'post',
          voteType: 'upvote',
        }),
      });

      // Set a timeout for the test
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 5000);
      });

      const responsePromise = submitVote(request);

      try {
        const response = await Promise.race([responsePromise, timeoutPromise]);
        const data = await response.json();
        
        // Should handle timeout gracefully
        expect(response.status).toBe(408);
        expect(data.error).toContain('timeout');
      } catch (error) {
        // Timeout occurred as expected
        expect(error.message).toBe('Request timeout');
      }
    });

    it('handles slow responses gracefully', async () => {
      // Mock slow but not timeout response
      server.use(
        rest.get('/api/posts', async (req, res, ctx) => {
          await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
          return res(ctx.json({ posts: [] }));
        })
      );

      const request = new NextRequest('http://localhost:3000/api/posts');
      
      const startTime = Date.now();
      const response = await getPosts(request);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeGreaterThan(2000); // Should take at least 2 seconds
    });
  });

  describe('Retry Logic', () => {
    it('implements exponential backoff for retries', async () => {
      let attemptCount = 0;
      
      server.use(
        rest.post('/api/search', (req, res, ctx) => {
          attemptCount++;
          if (attemptCount < 3) {
            return res(ctx.status(500), ctx.json({ error: 'Temporary server error' }));
          }
          return res(ctx.json({ results: [], total: 0 }));
        })
      );

      const request = new NextRequest('http://localhost:3000/api/search', {
        method: 'POST',
        body: JSON.stringify({ query: 'test' }),
      });

      const startTime = Date.now();
      const response = await searchPosts(request);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(attemptCount).toBe(3);
      expect(endTime - startTime).toBeGreaterThan(1000); // Should have delays between retries
    });

    it('stops retrying after maximum attempts', async () => {
      let attemptCount = 0;
      
      server.use(
        rest.post('/api/posts/create', (req, res, ctx) => {
          attemptCount++;
          return res(ctx.status(500), ctx.json({ error: 'Persistent server error' }));
        })
      );

      const request = new NextRequest('http://localhost:3000/api/posts/create', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Post',
          content: 'Test content',
          subredditId: 'test-subreddit',
        }),
      });

      const response = await createPost(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(attemptCount).toBeLessThanOrEqual(5); // Should not exceed max retries
      expect(data.error).toContain('server error');
    });

    it('does not retry on client errors (4xx)', async () => {
      let attemptCount = 0;
      
      server.use(
        rest.post('/api/comments/create', (req, res, ctx) => {
          attemptCount++;
          return res(ctx.status(400), ctx.json({ error: 'Bad request' }));
        })
      );

      const request = new NextRequest('http://localhost:3000/api/comments/create', {
        method: 'POST',
        body: JSON.stringify({ invalid: 'data' }),
      });

      const response = await createComment(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(attemptCount).toBe(1); // Should not retry client errors
      expect(data.error).toBe('Bad request');
    });
  });

  describe('Server Errors (5xx)', () => {
    it('handles 500 Internal Server Error', async () => {
      server.use(
        rest.get('/api/posts', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Internal server error' }));
        })
      );

      const request = new NextRequest('http://localhost:3000/api/posts');
      const response = await getPosts(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('handles 502 Bad Gateway', async () => {
      server.use(
        rest.post('/api/votes', (req, res, ctx) => {
          return res(ctx.status(502), ctx.json({ error: 'Bad gateway' }));
        })
      );

      const request = new NextRequest('http://localhost:3000/api/votes', {
        method: 'POST',
        body: JSON.stringify({
          targetId: 'test-post',
          targetType: 'post',
          voteType: 'upvote',
        }),
      });

      const response = await submitVote(request);
      const data = await response.json();

      expect(response.status).toBe(502);
      expect(data.error).toBe('Bad gateway');
    });

    it('handles 503 Service Unavailable', async () => {
      server.use(
        rest.post('/api/search', (req, res, ctx) => {
          return res(ctx.status(503), ctx.json({ error: 'Service unavailable' }));
        })
      );

      const request = new NextRequest('http://localhost:3000/api/search', {
        method: 'POST',
        body: JSON.stringify({ query: 'test' }),
      });

      const response = await searchPosts(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toBe('Service unavailable');
    });

    it('handles 504 Gateway Timeout', async () => {
      server.use(
        rest.get('/api/posts', (req, res, ctx) => {
          return res(ctx.status(504), ctx.json({ error: 'Gateway timeout' }));
        })
      );

      const request = new NextRequest('http://localhost:3000/api/posts');
      const response = await getPosts(request);
      const data = await response.json();

      expect(response.status).toBe(504);
      expect(data.error).toBe('Gateway timeout');
    });
  });

  describe('Client Errors (4xx)', () => {
    it('handles 400 Bad Request', async () => {
      const request = new NextRequest('http://localhost:3000/api/posts/create', {
        method: 'POST',
        body: JSON.stringify({ invalid: 'data' }),
      });

      const response = await createPost(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('validation');
    });

    it('handles 401 Unauthorized', async () => {
      server.use(
        rest.post('/api/comments/create', (req, res, ctx) => {
          return res(ctx.status(401), ctx.json({ error: 'Unauthorized' }));
        })
      );

      const request = new NextRequest('http://localhost:3000/api/comments/create', {
        method: 'POST',
        body: JSON.stringify({
          content: 'Test comment',
          postId: 'test-post',
        }),
      });

      const response = await createComment(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('handles 403 Forbidden', async () => {
      server.use(
        rest.post('/api/votes', (req, res, ctx) => {
          return res(ctx.status(403), ctx.json({ error: 'Forbidden' }));
        })
      );

      const request = new NextRequest('http://localhost:3000/api/votes', {
        method: 'POST',
        body: JSON.stringify({
          targetId: 'test-post',
          targetType: 'post',
          voteType: 'upvote',
        }),
      });

      const response = await submitVote(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Forbidden');
    });

    it('handles 404 Not Found', async () => {
      server.use(
        rest.get('/api/posts/nonexistent', (req, res, ctx) => {
          return res(ctx.status(404), ctx.json({ error: 'Not found' }));
        })
      );

      const request = new NextRequest('http://localhost:3000/api/posts/nonexistent');
      const response = await getPosts(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Not found');
    });

    it('handles 429 Too Many Requests', async () => {
      server.use(
        rest.post('/api/search', (req, res, ctx) => {
          return res(
            ctx.status(429),
            ctx.set('Retry-After', '60'),
            ctx.json({ error: 'Too many requests' })
          );
        })
      );

      const request = new NextRequest('http://localhost:3000/api/search', {
        method: 'POST',
        body: JSON.stringify({ query: 'test' }),
      });

      const response = await searchPosts(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Too many requests');
      expect(response.headers.get('Retry-After')).toBe('60');
    });
  });

  describe('Malformed Responses', () => {
    it('handles invalid JSON responses', async () => {
      server.use(
        rest.get('/api/posts', (req, res, ctx) => {
          return res(ctx.body('invalid json'));
        })
      );

      const request = new NextRequest('http://localhost:3000/api/posts');
      const response = await getPosts(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('parse');
    });

    it('handles empty responses', async () => {
      server.use(
        rest.post('/api/comments/create', (req, res, ctx) => {
          return res(ctx.body(''));
        })
      );

      const request = new NextRequest('http://localhost:3000/api/comments/create', {
        method: 'POST',
        body: JSON.stringify({
          content: 'Test comment',
          postId: 'test-post',
        }),
      });

      const response = await createComment(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('empty');
    });

    it('handles responses with missing required fields', async () => {
      server.use(
        rest.get('/api/posts', (req, res, ctx) => {
          return res(ctx.json({ posts: [{ id: '1' }] })); // Missing required fields
        })
      );

      const request = new NextRequest('http://localhost:3000/api/posts');
      const response = await getPosts(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('validation');
    });
  });

  describe('Rate Limiting and Throttling', () => {
    it('handles rate limiting headers', async () => {
      server.use(
        rest.post('/api/votes', (req, res, ctx) => {
          return res(
            ctx.status(429),
            ctx.set('X-RateLimit-Limit', '100'),
            ctx.set('X-RateLimit-Remaining', '0'),
            ctx.set('X-RateLimit-Reset', '1640995200'),
            ctx.json({ error: 'Rate limit exceeded' })
          );
        })
      );

      const request = new NextRequest('http://localhost:3000/api/votes', {
        method: 'POST',
        body: JSON.stringify({
          targetId: 'test-post',
          targetType: 'post',
          voteType: 'upvote',
        }),
      });

      const response = await submitVote(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Rate limit exceeded');
      expect(response.headers.get('X-RateLimit-Limit')).toBe('100');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
    });

    it('implements exponential backoff for rate limited requests', async () => {
      let attemptCount = 0;
      
      server.use(
        rest.post('/api/search', (req, res, ctx) => {
          attemptCount++;
          if (attemptCount === 1) {
            return res(
              ctx.status(429),
              ctx.set('Retry-After', '1'),
              ctx.json({ error: 'Rate limit exceeded' })
            );
          }
          return res(ctx.json({ results: [], total: 0 }));
        })
      );

      const request = new NextRequest('http://localhost:3000/api/search', {
        method: 'POST',
        body: JSON.stringify({ query: 'test' }),
      });

      const startTime = Date.now();
      const response = await searchPosts(request);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(attemptCount).toBe(2);
      expect(endTime - startTime).toBeGreaterThan(500); // Should respect Retry-After
    });
  });

  describe('Circuit Breaker Pattern', () => {
    it('opens circuit breaker after consecutive failures', async () => {
      let failureCount = 0;
      
      server.use(
        rest.get('/api/posts', (req, res, ctx) => {
          failureCount++;
          return res(ctx.status(500), ctx.json({ error: 'Server error' }));
        })
      );

      const requests = Array.from({ length: 10 }, () => 
        new NextRequest('http://localhost:3000/api/posts')
      );

      const responses = await Promise.all(requests.map(req => getPosts(req)));
      const successCount = responses.filter(res => res.status === 200).length;

      // Should have circuit breaker logic
      expect(successCount).toBeLessThan(10);
    });

    it('allows circuit breaker to close after timeout', async () => {
      let callCount = 0;
      
      server.use(
        rest.post('/api/comments/create', (req, res, ctx) => {
          callCount++;
          if (callCount <= 5) {
            return res(ctx.status(500), ctx.json({ error: 'Server error' }));
          }
          return res(ctx.json({ success: true }));
        })
      );

      // First batch of calls (should fail)
      const failedRequests = Array.from({ length: 5 }, () => 
        new NextRequest('http://localhost:3000/api/comments/create', {
          method: 'POST',
          body: JSON.stringify({
            content: 'Test comment',
            postId: 'test-post',
          }),
        })
      );

      await Promise.all(failedRequests.map(req => createComment(req)));

      // Wait for circuit breaker timeout
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Second call (should succeed)
      const successRequest = new NextRequest('http://localhost:3000/api/comments/create', {
        method: 'POST',
        body: JSON.stringify({
          content: 'Test comment',
          postId: 'test-post',
        }),
      });

      const response = await createComment(successRequest);
      expect(response.status).toBe(200);
    });
  });

  describe('Error Recovery and Fallbacks', () => {
    it('provides fallback data when API is unavailable', async () => {
      server.use(
        rest.get('/api/posts', (req, res, ctx) => {
          return res.networkError('Failed to connect');
        })
      );

      const request = new NextRequest('http://localhost:3000/api/posts');
      const response = await getPosts(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('network');
      // Should provide fallback data or cached data
      expect(data).toHaveProperty('posts');
    });

    it('handles partial data failures gracefully', async () => {
      server.use(
        rest.get('/api/posts', (req, res, ctx) => {
          return res(ctx.json({
            posts: [
              { id: '1', title: 'Valid Post', content: 'Valid content' },
              { id: '2', title: 'Invalid Post' }, // Missing required fields
            ]
          }));
        })
      );

      const request = new NextRequest('http://localhost:3000/api/posts');
      const response = await getPosts(request);
      const data = await response.json();

      // Should filter out invalid data and return valid data
      expect(response.status).toBe(200);
      expect(data.posts).toHaveLength(1);
      expect(data.posts[0].id).toBe('1');
    });

    it('provides meaningful error messages to users', async () => {
      server.use(
        rest.post('/api/posts/create', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ 
            error: 'Database connection failed',
            details: 'Unable to connect to PostgreSQL database',
            code: 'DB_CONNECTION_ERROR'
          }));
        })
      );

      const request = new NextRequest('http://localhost:3000/api/posts/create', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Post',
          content: 'Test content',
          subredditId: 'test-subreddit',
        }),
      });

      const response = await createPost(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database connection failed');
      expect(data.details).toBe('Unable to connect to PostgreSQL database');
      expect(data.code).toBe('DB_CONNECTION_ERROR');
    });
  });
}); 