/**
 * Comprehensive error handling utilities for API calls
 */

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableStatusCodes: number[];
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  expectedErrors: number;
}

export interface TimeoutConfig {
  requestTimeout: number;
  connectionTimeout: number;
}

export interface ErrorResponse {
  error: string;
  details?: string;
  code?: string;
  retryAfter?: number;
  fallbackData?: any;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  retryAfter?: number;
  isRetryable: boolean;
  isNetworkError: boolean;
  isTimeoutError: boolean;
}

/**
 * Default configurations
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  recoveryTimeout: 60000, // 1 minute
  expectedErrors: 0.5, // 50% error rate threshold
};

const DEFAULT_TIMEOUT_CONFIG: TimeoutConfig = {
  requestTimeout: 10000, // 10 seconds
  connectionTimeout: 5000, // 5 seconds
};

/**
 * Circuit Breaker implementation
 */
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  private config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CIRCUIT_BREAKER_CONFIG, ...config };
  }

  canExecute(): boolean {
    switch (this.state) {
      case 'CLOSED':
        return true;
      case 'OPEN':
        if (Date.now() - this.lastFailureTime >= this.config.recoveryTimeout) {
          this.state = 'HALF_OPEN';
          return true;
        }
        return false;
      case 'HALF_OPEN':
        return true;
      default:
        return false;
    }
  }

  onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState(): string {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }
}

/**
 * Retry utility with exponential backoff
 */
class RetryHandler {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  async execute<T>(
    operation: () => Promise<T>,
    attempt = 1
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= this.config.maxAttempts || !this.shouldRetry(error)) {
        throw error;
      }

      const delay = this.calculateDelay(attempt);
      await this.sleep(delay);

      return this.execute(operation, attempt + 1);
    }
  }

  private shouldRetry(error: any): boolean {
    if (error.isNetworkError || error.isTimeoutError) {
      return true;
    }

    if (error.status && this.config.retryableStatusCodes.includes(error.status)) {
      return true;
    }

    return false;
  }

  private calculateDelay(attempt: number): number {
    const delay = this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt - 1);
    return Math.min(delay, this.config.maxDelay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Timeout utility
 */
class TimeoutHandler {
  private config: TimeoutConfig;

  constructor(config: Partial<TimeoutConfig> = {}) {
    this.config = { ...DEFAULT_TIMEOUT_CONFIG, ...config };
  }

  async withTimeout<T>(operation: Promise<T>): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        const error = new Error('Request timeout') as ApiError;
        error.isTimeoutError = true;
        error.isRetryable = true;
        error.isNetworkError = false;
        reject(error);
      }, this.config.requestTimeout);
    });

    return Promise.race([operation, timeoutPromise]);
  }
}

/**
 * Error classification utility
 */
class ErrorClassifier {
  static classifyError(error: any): ApiError {
    const apiError = error as ApiError;

    // Network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
      apiError.isNetworkError = true;
      apiError.isRetryable = true;
      apiError.isTimeoutError = false;
      return apiError;
    }

    // Timeout errors
    if (error.message?.includes('timeout') || error.code === 'ETIMEDOUT') {
      apiError.isTimeoutError = true;
      apiError.isRetryable = true;
      apiError.isNetworkError = false;
      return apiError;
    }

    // HTTP status code errors
    if (error.status) {
      apiError.isRetryable = [408, 429, 500, 502, 503, 504].includes(error.status);
      apiError.isNetworkError = false;
      apiError.isTimeoutError = false;
      return apiError;
    }

    // Default classification
    apiError.isRetryable = false;
    apiError.isNetworkError = false;
    apiError.isTimeoutError = false;
    return apiError;
  }
}

/**
 * Fallback data provider
 */
class FallbackProvider {
  private static fallbackData: Map<string, any> = new Map();

  static setFallbackData(key: string, data: any): void {
    this.fallbackData.set(key, data);
  }

  static getFallbackData(key: string): any {
    return this.fallbackData.get(key);
  }

  static hasFallbackData(key: string): boolean {
    return this.fallbackData.has(key);
  }
}

/**
 * Main API client with comprehensive error handling
 */
export class ApiClient {
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private retryHandlers: Map<string, RetryHandler> = new Map();
  private timeoutHandlers: Map<string, TimeoutHandler> = new Map();

  constructor(
    private baseUrl: string = '',
    private defaultConfig: {
      retry?: Partial<RetryConfig>;
      circuitBreaker?: Partial<CircuitBreakerConfig>;
      timeout?: Partial<TimeoutConfig>;
    } = {}
  ) {}

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    config?: {
      retry?: Partial<RetryConfig>;
      circuitBreaker?: Partial<CircuitBreakerConfig>;
      timeout?: Partial<TimeoutConfig>;
      fallbackKey?: string;
    }
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const circuitBreakerKey = `${options.method || 'GET'}:${endpoint}`;
    
    // Get or create circuit breaker
    let circuitBreaker = this.circuitBreakers.get(circuitBreakerKey);
    if (!circuitBreaker) {
      circuitBreaker = new CircuitBreaker({
        ...this.defaultConfig.circuitBreaker,
        ...config?.circuitBreaker,
      });
      this.circuitBreakers.set(circuitBreakerKey, circuitBreaker);
    }

    // Check circuit breaker
    if (!circuitBreaker.canExecute()) {
      const fallbackData = config?.fallbackKey 
        ? FallbackProvider.getFallbackData(config.fallbackKey)
        : null;
      
      if (fallbackData) {
        return fallbackData;
      }
      
      throw new Error('Circuit breaker is open') as ApiError;
    }

    // Get or create retry handler
    let retryHandler = this.retryHandlers.get(circuitBreakerKey);
    if (!retryHandler) {
      retryHandler = new RetryHandler({
        ...this.defaultConfig.retry,
        ...config?.retry,
      });
      this.retryHandlers.set(circuitBreakerKey, retryHandler);
    }

    // Get or create timeout handler
    let timeoutHandler = this.timeoutHandlers.get(circuitBreakerKey);
    if (!timeoutHandler) {
      timeoutHandler = new TimeoutHandler({
        ...this.defaultConfig.timeout,
        ...config?.timeout,
      });
      this.timeoutHandlers.set(circuitBreakerKey, timeoutHandler);
    }

    try {
      const result = await retryHandler.execute(async () => {
        return timeoutHandler.withTimeout(this.makeRequest<T>(url, options));
      });

      circuitBreaker.onSuccess();
      return result;
    } catch (error) {
      const classifiedError = ErrorClassifier.classifyError(error);
      circuitBreaker.onFailure();

      // Try fallback data if available
      if (config?.fallbackKey && FallbackProvider.hasFallbackData(config.fallbackKey)) {
        return FallbackProvider.getFallbackData(config.fallbackKey);
      }

      throw classifiedError;
    }
  }

  private async makeRequest<T>(url: string, options: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as ApiError;
      error.status = response.status;
      error.code = `HTTP_${response.status}`;
      
      // Check for retry-after header
      const retryAfter = response.headers.get('Retry-After');
      if (retryAfter) {
        error.retryAfter = parseInt(retryAfter, 10);
      }

      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }

    return response.text() as T;
  }

  // Convenience methods
  async get<T>(endpoint: string, config?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, config);
  }

  async post<T>(endpoint: string, data?: any, config?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, config);
  }

  async put<T>(endpoint: string, data?: any, config?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, config);
  }

  async delete<T>(endpoint: string, config?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, config);
  }
}

/**
 * Error response formatter
 */
export function formatErrorResponse(error: ApiError): ErrorResponse {
  const response: ErrorResponse = {
    error: error.message || 'An unexpected error occurred',
  };

  if (error.details) {
    response.details = error.details;
  }

  if (error.code) {
    response.code = error.code;
  }

  if (error.retryAfter) {
    response.retryAfter = error.retryAfter;
  }

  return response;
}

/**
 * Global API client instance
 */
export const apiClient = new ApiClient();

/**
 * Utility functions for common error handling patterns
 */
export const errorHandling = {
  /**
   * Execute with fallback
   */
  async withFallback<T>(
    operation: () => Promise<T>,
    fallback: () => T | Promise<T>
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.warn('Operation failed, using fallback:', error);
      return fallback();
    }
  },

  /**
   * Execute with timeout
   */
  async withTimeout<T>(
    operation: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    const timeoutHandler = new TimeoutHandler({ requestTimeout: timeoutMs });
    return timeoutHandler.withTimeout(operation);
  },

  /**
   * Execute with retry
   */
  async withRetry<T>(
    operation: () => Promise<T>,
    config?: Partial<RetryConfig>
  ): Promise<T> {
    const retryHandler = new RetryHandler(config);
    return retryHandler.execute(operation);
  },

  /**
   * Execute with circuit breaker
   */
  async withCircuitBreaker<T>(
    operation: () => Promise<T>,
    key: string,
    config?: Partial<CircuitBreakerConfig>
  ): Promise<T> {
    const circuitBreaker = new CircuitBreaker(config);
    
    if (!circuitBreaker.canExecute()) {
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await operation();
      circuitBreaker.onSuccess();
      return result;
    } catch (error) {
      circuitBreaker.onFailure();
      throw error;
    }
  },

  /**
   * Set fallback data
   */
  setFallbackData(key: string, data: any): void {
    FallbackProvider.setFallbackData(key, data);
  },

  /**
   * Get fallback data
   */
  getFallbackData(key: string): any {
    return FallbackProvider.getFallbackData(key);
  },
};

export default apiClient; 