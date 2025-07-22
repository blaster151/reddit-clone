import { handleApiError, ApiError } from './api-error';

describe('handleApiError', () => {
  it('handles ApiError with status and details', () => {
    const error = new ApiError(403, 'Forbidden', { reason: 'No access' });
    const response: any = handleApiError(error);
    expect(response.status).toBe(403);
    expect(response.body).toBeUndefined(); // NextResponse.json returns a Response, but we can check the structure
  });

  it('handles ZodError', () => {
    const zodError = {
      issues: [{ path: ['field'], message: 'Invalid' }],
      name: 'ZodError',
    };
    const response: any = handleApiError(zodError as any);
    expect(response.status).toBe(400);
  });

  it('handles generic Error', () => {
    const error = new Error('Something went wrong');
    const response: any = handleApiError(error);
    expect(response.status).toBe(500);
  });
}); 