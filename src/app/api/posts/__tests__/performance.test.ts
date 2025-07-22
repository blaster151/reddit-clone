describe('Performance: GET /api/posts', () => {
  it('handles 50 concurrent requests efficiently', async () => {
    const start = Date.now();
    const requests = Array.from({ length: 50 }, () => fetch('/api/posts'));
    const responses = await Promise.all(requests);
    const times = Date.now() - start;
    responses.forEach((res) => expect(res.status).toBe(200));
    // Arbitrary threshold: all requests should complete within 2 seconds
    expect(times).toBeLessThan(2000);
  });
}); 