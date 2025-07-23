import { 
  ApiClient, 
  CircuitBreaker, 
  RetryHandler, 
  TimeoutHandler, 
  ErrorClassifier, 
  FallbackProvider,
  formatErrorResponse,
  errorHandling,
  ApiError,
  RetryConfig,
  CircuitBreakerConfig,
  TimeoutConfig
} from '../error-handling';

// Mock fetch
global.fetch = jest.fn();

describe('Error Handling Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('CircuitBreaker', () => {
    let circuitBreaker: CircuitBreaker;

    beforeEach(() => {
      circuitBreaker = new CircuitBreaker();
    });

    it('starts in CLOSED state', () => {
      expect(circuitBreaker.getState()).toBe('CLOSED');
      expect(circuitBreaker.canExecute()).toBe(true);
    });

    it('transitions to OPEN state after failure threshold', () => {
      // Simulate failures
      for (let i = 0; i < 5; i++) {
        circuitBreaker.onFailure();
      }

      expect(circuitBreaker.getState()).toBe('OPEN');
      expect(circuitBreaker.canExecute()).toBe(false);
    });

    it('transitions to HALF_OPEN state after recovery timeout', () => {
      // Open the circuit breaker
      for (let i = 0; i < 5; i++) {
        circuitBreaker.onFailure();
      }

      // Fast forward time
      jest.advanceTimersByTime(60000);

      expect(circuitBreaker.getState()).toBe('HALF_OPEN');
      expect(circuitBreaker.canExecute()).toBe(true);
    });

    it('transitions back to CLOSED state after successful execution', () => {
      // Open the circuit breaker
      for (let i = 0; i < 5; i++) {
        circuitBreaker.onFailure();
      }

      // Fast forward time to allow HALF_OPEN
      jest.advanceTimersByTime(60000);

      // Simulate success
      circuitBreaker.onSuccess();

      expect(circuitBreaker.getState()).toBe('CLOSED');
      expect(circuitBreaker.canExecute()).toBe(true);
    });

    it('resets failure count on success', () => {
      // Add some failures
      circuitBreaker.onFailure();
      circuitBreaker.onFailure();

      expect(circuitBreaker.getFailureCount()).toBe(2);

      // Simulate success
      circuitBreaker.onSuccess();

      expect(circuitBreaker.getFailureCount()).toBe(0);
    });

    it('uses custom configuration', () => {
      const customConfig: CircuitBreakerConfig = {
        failureThreshold: 3,
        recoveryTimeout: 30000,
        expectedErrors: 0.3,
      };

      const customCircuitBreaker = new CircuitBreaker(customConfig);

      // Should open after 3 failures instead of 5
      for (let i = 0; i < 3; i++) {
        customCircuitBreaker.onFailure();
      }

      expect(customCircuitBreaker.getState()).toBe('OPEN');
    });
  });

  describe('RetryHandler', () => {
    let retryHandler: RetryHandler;

    beforeEach(() => {
      retryHandler = new RetryHandler();
    });

    it('executes operation successfully on first try', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await retryHandler.execute(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('retries on network errors', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce({ isNetworkError: true })
        .mockResolvedValue('success');

      const result = await retryHandler.execute(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('retries on timeout errors', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce({ isTimeoutError: true })
        .mockResolvedValue('success');

      const result = await retryHandler.execute(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('retries on retryable status codes', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce({ status: 500 })
        .mockResolvedValue('success');

      const result = await retryHandler.execute(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('does not retry on non-retryable errors', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce({ status: 400 });

      await expect(retryHandler.execute(operation)).rejects.toEqual({ status: 400 });
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('stops retrying after maximum attempts', async () => {
      const operation = jest.fn()
        .mockRejectedValue({ isNetworkError: true });

      await expect(retryHandler.execute(operation)).rejects.toEqual({ isNetworkError: true });
      expect(operation).toHaveBeenCalledTimes(3); // Default max attempts
    });

    it('implements exponential backoff', async () => {
      jest.useFakeTimers();

      const operation = jest.fn()
        .mockRejectedValueOnce({ isNetworkError: true })
        .mockRejectedValueOnce({ isNetworkError: true })
        .mockResolvedValue('success');

      const executePromise = retryHandler.execute(operation);

      // First retry should wait 1 second
      jest.advanceTimersByTime(1000);
      await new Promise(resolve => setImmediate(resolve));

      // Second retry should wait 2 seconds
      jest.advanceTimersByTime(2000);
      await new Promise(resolve => setImmediate(resolve));

      const result = await executePromise;

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);

      jest.useRealTimers();
    });

    it('uses custom configuration', async () => {
      const customConfig: RetryConfig = {
        maxAttempts: 2,
        baseDelay: 500,
        maxDelay: 2000,
        backoffMultiplier: 1.5,
        retryableStatusCodes: [500],
      };

      const customRetryHandler = new RetryHandler(customConfig);
      const operation = jest.fn()
        .mockRejectedValueOnce({ status: 500 })
        .mockRejectedValueOnce({ status: 500 })
        .mockResolvedValue('success');

      await expect(customRetryHandler.execute(operation)).rejects.toEqual({ status: 500 });
      expect(operation).toHaveBeenCalledTimes(2); // Should stop after 2 attempts
    });
  });

  describe('TimeoutHandler', () => {
    let timeoutHandler: TimeoutHandler;

    beforeEach(() => {
      timeoutHandler = new TimeoutHandler();
    });

    it('executes operation within timeout', async () => {
      const operation = Promise.resolve('success');

      const result = await timeoutHandler.withTimeout(operation);

      expect(result).toBe('success');
    });

    it('throws timeout error when operation exceeds timeout', async () => {
      const slowOperation = new Promise(resolve => {
        setTimeout(() => resolve('success'), 15000);
      });

      await expect(timeoutHandler.withTimeout(slowOperation)).rejects.toThrow('Request timeout');
    });

    it('uses custom timeout configuration', async () => {
      const customConfig: TimeoutConfig = {
        requestTimeout: 1000,
        connectionTimeout: 500,
      };

      const customTimeoutHandler = new TimeoutHandler(customConfig);
      const slowOperation = new Promise(resolve => {
        setTimeout(() => resolve('success'), 2000);
      });

      await expect(customTimeoutHandler.withTimeout(slowOperation)).rejects.toThrow('Request timeout');
    });
  });

  describe('ErrorClassifier', () => {
    it('classifies network errors correctly', () => {
      const networkError = { code: 'ENOTFOUND' };
      const classified = ErrorClassifier.classifyError(networkError);

      expect(classified.isNetworkError).toBe(true);
      expect(classified.isRetryable).toBe(true);
      expect(classified.isTimeoutError).toBe(false);
    });

    it('classifies timeout errors correctly', () => {
      const timeoutError = { message: 'Request timeout' };
      const classified = ErrorClassifier.classifyError(timeoutError);

      expect(classified.isTimeoutError).toBe(true);
      expect(classified.isRetryable).toBe(true);
      expect(classified.isNetworkError).toBe(false);
    });

    it('classifies HTTP status codes correctly', () => {
      const serverError = { status: 500 };
      const clientError = { status: 400 };
      const retryableError = { status: 429 };

      const serverClassified = ErrorClassifier.classifyError(serverError);
      const clientClassified = ErrorClassifier.classifyError(clientError);
      const retryableClassified = ErrorClassifier.classifyError(retryableError);

      expect(serverClassified.isRetryable).toBe(true);
      expect(clientClassified.isRetryable).toBe(false);
      expect(retryableClassified.isRetryable).toBe(true);
    });

    it('provides default classification for unknown errors', () => {
      const unknownError = { message: 'Unknown error' };
      const classified = ErrorClassifier.classifyError(unknownError);

      expect(classified.isRetryable).toBe(false);
      expect(classified.isNetworkError).toBe(false);
      expect(classified.isTimeoutError).toBe(false);
    });
  });

  describe('FallbackProvider', () => {
    beforeEach(() => {
      // Clear any existing fallback data
      FallbackProvider.setFallbackData('test', null);
    });

    it('stores and retrieves fallback data', () => {
      const testData = { posts: [] };
      FallbackProvider.setFallbackData('posts', testData);

      expect(FallbackProvider.getFallbackData('posts')).toEqual(testData);
      expect(FallbackProvider.hasFallbackData('posts')).toBe(true);
    });

    it('returns undefined for non-existent keys', () => {
      expect(FallbackProvider.getFallbackData('nonexistent')).toBeUndefined();
      expect(FallbackProvider.hasFallbackData('nonexistent')).toBe(false);
    });

    it('overwrites existing fallback data', () => {
      FallbackProvider.setFallbackData('test', 'old');
      FallbackProvider.setFallbackData('test', 'new');

      expect(FallbackProvider.getFallbackData('test')).toBe('new');
    });
  });

  describe('ApiClient', () => {
    let apiClient: ApiClient;

    beforeEach(() => {
      apiClient = new ApiClient();
    });

    it('makes successful requests', async () => {
      const mockResponse = { posts: [] };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
        headers: new Map([['content-type', 'application/json']]),
      });

      const result = await apiClient.get('/api/posts');

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/posts', expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }));
    });

    it('handles HTTP errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(apiClient.get('/api/posts')).rejects.toThrow('HTTP 500: Internal Server Error');
    });

    it('handles network errors with retry', async () => {
      const mockResponse = { posts: [] };
      
      (fetch as jest.Mock)
        .mockRejectedValueOnce({ code: 'ENOTFOUND' })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
          headers: new Map([['content-type', 'application/json']]),
        });

      const result = await apiClient.get('/api/posts');

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('uses fallback data when circuit breaker is open', async () => {
      const fallbackData = { posts: [] };
      FallbackProvider.setFallbackData('posts', fallbackData);

      // Open circuit breaker
      for (let i = 0; i < 5; i++) {
        (fetch as jest.Mock).mockRejectedValueOnce({ code: 'ENOTFOUND' });
      }

      // This should use fallback data
      const result = await apiClient.request('/api/posts', { method: 'GET' }, {
        fallbackKey: 'posts',
      });

      expect(result).toEqual(fallbackData);
    });

    it('handles POST requests with data', async () => {
      const postData = { title: 'Test Post', content: 'Test content' };
      const mockResponse = { success: true };
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
        headers: new Map([['content-type', 'application/json']]),
      });

      const result = await apiClient.post('/api/posts', postData);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/posts', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(postData),
      }));
    });

    it('respects retry-after headers', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Map([['retry-after', '60']]),
      });

      try {
        await apiClient.get('/api/posts');
      } catch (error) {
        expect((error as ApiError).retryAfter).toBe(60);
      }
    });
  });

  describe('formatErrorResponse', () => {
    it('formats basic error', () => {
      const error = new Error('Test error') as ApiError;
      const response = formatErrorResponse(error);

      expect(response.error).toBe('Test error');
    });

    it('includes additional error properties', () => {
      const error = new Error('Database error') as ApiError;
      error.details = 'Connection failed';
      error.code = 'DB_ERROR';
      error.retryAfter = 30;

      const response = formatErrorResponse(error);

      expect(response.error).toBe('Database error');
      expect(response.details).toBe('Connection failed');
      expect(response.code).toBe('DB_ERROR');
      expect(response.retryAfter).toBe(30);
    });

    it('provides default error message', () => {
      const error = {} as ApiError;
      const response = formatErrorResponse(error);

      expect(response.error).toBe('An unexpected error occurred');
    });
  });

  describe('errorHandling utilities', () => {
    it('executes with fallback', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Failed'));
      const fallback = jest.fn().mockResolvedValue('fallback');

      const result = await errorHandling.withFallback(operation, fallback);

      expect(result).toBe('fallback');
      expect(operation).toHaveBeenCalled();
      expect(fallback).toHaveBeenCalled();
    });

    it('executes with timeout', async () => {
      const operation = Promise.resolve('success');
      const result = await errorHandling.withTimeout(operation, 5000);

      expect(result).toBe('success');
    });

    it('executes with retry', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce({ isNetworkError: true })
        .mockResolvedValue('success');

      const result = await errorHandling.withRetry(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('executes with circuit breaker', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const result = await errorHandling.withCircuitBreaker(operation, 'test-key');

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalled();
    });

    it('manages fallback data', () => {
      const testData = { test: 'data' };
      errorHandling.setFallbackData('test', testData);

      expect(errorHandling.getFallbackData('test')).toEqual(testData);
    });
  });

  describe('Integration Tests', () => {
    it('handles complex error scenarios', async () => {
      const apiClient = new ApiClient();
      const fallbackData = { posts: [] };
      FallbackProvider.setFallbackData('posts', fallbackData);

      // Simulate network failure followed by success
      (fetch as jest.Mock)
        .mockRejectedValueOnce({ code: 'ENOTFOUND' })
        .mockRejectedValueOnce({ code: 'ECONNREFUSED' })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ posts: [{ id: '1', title: 'Test' }] }),
          headers: new Map([['content-type', 'application/json']]),
        });

      const result = await apiClient.request('/api/posts', { method: 'GET' }, {
        fallbackKey: 'posts',
        retry: { maxAttempts: 3 },
      });

      expect(result).toEqual({ posts: [{ id: '1', title: 'Test' }] });
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('handles circuit breaker with fallback', async () => {
      const apiClient = new ApiClient();
      const fallbackData = { posts: [] };
      FallbackProvider.setFallbackData('posts', fallbackData);

      // Open circuit breaker
      for (let i = 0; i < 5; i++) {
        (fetch as jest.Mock).mockRejectedValueOnce({ code: 'ENOTFOUND' });
      }

      // Should use fallback data
      const result = await apiClient.request('/api/posts', { method: 'GET' }, {
        fallbackKey: 'posts',
      });

      expect(result).toEqual(fallbackData);
    });

    it('handles timeout with retry', async () => {
      const apiClient = new ApiClient();
      
      // Simulate timeout followed by success
      (fetch as jest.Mock)
        .mockImplementationOnce(() => new Promise((_, reject) => {
          setTimeout(() => reject({ message: 'Request timeout' }), 15000);
        }))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
          headers: new Map([['content-type', 'application/json']]),
        });

      const result = await apiClient.request('/api/test', { method: 'GET' }, {
        timeout: { requestTimeout: 5000 },
        retry: { maxAttempts: 2 },
      });

      expect(result).toEqual({ success: true });
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
}); 