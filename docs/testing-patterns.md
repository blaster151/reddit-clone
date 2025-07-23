# Testing Patterns and Best Practices

This document outlines the testing patterns, best practices, and conventions used throughout the Reddit clone project.

## Table of Contents

1. [Testing Framework Setup](#testing-framework-setup)
2. [Component Testing Patterns](#component-testing-patterns)
3. [Hook Testing Patterns](#hook-testing-patterns)
4. [API Route Testing Patterns](#api-route-testing-patterns)
5. [Mocking Strategies](#mocking-strategies)
6. [Test Organization](#test-organization)
7. [Best Practices](#best-practices)
8. [Common Patterns](#common-patterns)
9. [Troubleshooting](#troubleshooting)

## Testing Framework Setup

### Jest Configuration

The project uses Jest as the primary testing framework with the following configuration:

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
  ],
};
```

### Testing Libraries

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **MSW (Mock Service Worker)**: API mocking for integration tests
- **jest-axe**: Accessibility testing
- **ts-jest**: TypeScript support for Jest

## Component Testing Patterns

### Basic Component Test Structure

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  // Setup mock data
  const mockProps = {
    // Define mock props
  };

  beforeEach(() => {
    // Reset mocks and setup
  });

  afterEach(() => {
    // Cleanup
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with basic information', () => {
      render(<ComponentName {...mockProps} />);
      
      expect(screen.getByText('Expected Text')).toBeInTheDocument();
    });

    it('renders with custom props', () => {
      render(<ComponentName {...mockProps} customProp="value" />);
      
      expect(screen.getByText('Custom Text')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('handles user interactions correctly', () => {
      const mockHandler = jest.fn();
      render(<ComponentName {...mockProps} onAction={mockHandler} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(mockHandler).toHaveBeenCalledWith(expectedArgs);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty states', () => {
      render(<ComponentName {...mockProps} data={[]} />);
      
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('handles loading states', () => {
      render(<ComponentName {...mockProps} loading={true} />);
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });
});
```

### Component Testing Best Practices

1. **Test User Behavior, Not Implementation**
   ```typescript
   // ✅ Good: Test what the user sees and does
   expect(screen.getByText('Submit')).toBeInTheDocument();
   fireEvent.click(screen.getByRole('button'));

   // ❌ Bad: Test implementation details
   expect(component.state.isSubmitted).toBe(true);
   ```

2. **Use Semantic Queries**
   ```typescript
   // ✅ Good: Use semantic queries
   screen.getByRole('button', { name: /submit/i });
   screen.getByLabelText(/email address/i);
   screen.getByTestId('loading-spinner');

   // ❌ Bad: Use non-semantic queries
   screen.getByClassName('btn-submit');
   ```

3. **Test Accessibility**
   ```typescript
   import { axe, toHaveNoViolations } from 'jest-axe';

   expect.extend(toHaveNoViolations);

   it('should not have accessibility violations', async () => {
     const { container } = render(<ComponentName />);
     const results = await axe(container);
     expect(results).toHaveNoViolations();
   });
   ```

## Hook Testing Patterns

### Custom Hook Test Structure

```typescript
import { renderHook, waitFor, act } from '@testing-library/react';
import { useCustomHook } from './useCustomHook';

describe('useCustomHook', () => {
  beforeEach(() => {
    // Setup mocks
    jest.clearAllMocks();
  });

  it('returns initial state', () => {
    const { result } = renderHook(() => useCustomHook());

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('fetches data successfully', async () => {
    const { result } = renderHook(() => useCustomHook());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(expectedData);
    expect(result.current.error).toBeNull();
  });

  it('handles errors gracefully', async () => {
    // Mock API to throw error
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useCustomHook());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('API Error');
    expect(result.current.data).toBeNull();
  });

  it('updates state when dependencies change', () => {
    const { result, rerender } = renderHook(
      ({ id }) => useCustomHook(id),
      { initialProps: { id: '1' } }
    );

    rerender({ id: '2' });

    expect(result.current.data).toEqual(newData);
  });
});
```

### Hook Testing Best Practices

1. **Test State Transitions**
   ```typescript
   it('transitions through loading, success, and error states', async () => {
     const { result } = renderHook(() => useCustomHook());

     // Initial loading state
     expect(result.current.loading).toBe(true);

     // Success state
     await waitFor(() => {
       expect(result.current.loading).toBe(false);
       expect(result.current.data).toBeDefined();
     });
   });
   ```

2. **Test Side Effects**
   ```typescript
   it('calls API when hook mounts', () => {
     const mockFetch = jest.spyOn(global, 'fetch');
     renderHook(() => useCustomHook());

     expect(mockFetch).toHaveBeenCalledWith('/api/endpoint');
   });
   ```

3. **Test Cleanup**
   ```typescript
   it('cleans up on unmount', () => {
     const mockCleanup = jest.fn();
     const { unmount } = renderHook(() => useCustomHook());

     unmount();

     expect(mockCleanup).toHaveBeenCalled();
   });
   ```

## API Route Testing Patterns

### API Route Test Structure

```typescript
import { NextRequest } from 'next/server';
import { GET, POST } from './route';

describe('API Route', () => {
  const createMockRequest = (url: string, body?: any): NextRequest => {
    const request = new NextRequest(url);
    if (body) {
      // Mock request.json() for POST requests
      jest.spyOn(request, 'json').mockResolvedValue(body);
    }
    return request;
  };

  describe('GET /api/endpoint', () => {
    it('returns data successfully', async () => {
      const req = createMockRequest('http://localhost/api/endpoint');
      const response = await GET(req);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(expectedData);
    });

    it('handles query parameters', async () => {
      const req = createMockRequest('http://localhost/api/endpoint?param=value');
      const response = await GET(req);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.param).toBe('value');
    });
  });

  describe('POST /api/endpoint', () => {
    it('creates resource successfully', async () => {
      const body = { name: 'Test', value: '123' };
      const req = createMockRequest('http://localhost/api/endpoint', body);
      const response = await POST(req);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.name).toBe('Test');
    });

    it('validates input data', async () => {
      const invalidBody = { name: '' }; // Invalid data
      const req = createMockRequest('http://localhost/api/endpoint', invalidBody);
      const response = await POST(req);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });
});
```

### API Route Testing Best Practices

1. **Test Request/Response Cycle**
   ```typescript
   it('returns correct headers', async () => {
     const req = createMockRequest('http://localhost/api/endpoint');
     const response = await GET(req);

     expect(response.headers.get('Content-Type')).toBe('application/json');
     expect(response.headers.get('Cache-Control')).toBe('public, max-age=60');
   });
   ```

2. **Test Error Handling**
   ```typescript
   it('handles validation errors', async () => {
     const invalidBody = { invalid: 'data' };
     const req = createMockRequest('http://localhost/api/endpoint', invalidBody);
     const response = await POST(req);

     expect(response.status).toBe(400);
     const data = await response.json();
     expect(data.error).toContain('validation');
   });
   ```

3. **Test Edge Cases**
   ```typescript
   it('handles empty results', async () => {
     const req = createMockRequest('http://localhost/api/endpoint?filter=nonexistent');
     const response = await GET(req);

     expect(response.status).toBe(200);
     const data = await response.json();
     expect(data.results).toEqual([]);
   });
   ```

## Mocking Strategies

### MSW (Mock Service Worker) Setup

```typescript
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('/api/posts', () => {
    return HttpResponse.json({
      posts: [
        { id: '1', title: 'Test Post', content: 'Test content' }
      ]
    });
  }),
  http.post('/api/posts', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ post: { ...body, id: 'new-id' } }, { status: 201 });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Jest Mocking Patterns

1. **Module Mocking**
   ```typescript
   // Mock entire module
   jest.mock('@/hooks/useAuth', () => ({
     useAuth: () => ({
       user: { id: 'user1', username: 'testuser' },
       isAuthenticated: true,
       login: jest.fn(),
       logout: jest.fn(),
     }),
   }));

   // Mock specific function
   jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({
     user: mockUser,
     isAuthenticated: true,
   });
   ```

2. **Function Mocking**
   ```typescript
   const mockHandler = jest.fn();
   
   // Mock with return value
   mockHandler.mockReturnValue('result');
   
   // Mock with implementation
   mockHandler.mockImplementation((arg) => {
     return `processed: ${arg}`;
   });
   
   // Mock async function
   mockHandler.mockResolvedValue('async result');
   ```

3. **API Mocking**
   ```typescript
   // Mock fetch
   global.fetch = jest.fn(() =>
     Promise.resolve({
       ok: true,
       status: 200,
       json: () => Promise.resolve(mockData),
     })
   ) as jest.Mock;
   ```

## Test Organization

### File Structure

```
src/
├── components/
│   ├── ComponentName.tsx
│   └── __tests__/
│       ├── ComponentName.test.tsx
│       └── ComponentName.integration.test.tsx
├── hooks/
│   ├── useCustomHook.ts
│   └── __tests__/
│       └── useCustomHook.test.ts
└── app/
    └── api/
        └── endpoint/
            ├── route.ts
            └── __tests__/
                ├── route.test.ts
                ├── route.error.test.ts
                └── route.msw.test.ts
```

### Test Naming Conventions

```typescript
// Component tests
describe('ComponentName', () => {
  describe('Rendering', () => { /* ... */ });
  describe('Interactions', () => { /* ... */ });
  describe('Edge Cases', () => { /* ... */ });
});

// Hook tests
describe('useCustomHook', () => {
  it('returns initial state', () => { /* ... */ });
  it('fetches data successfully', () => { /* ... */ });
  it('handles errors gracefully', () => { /* ... */ });
});

// API tests
describe('GET /api/endpoint', () => { /* ... */ });
describe('POST /api/endpoint', () => { /* ... */ });
describe('API error cases: /api/endpoint', () => { /* ... */ });
```

## Best Practices

### General Testing Principles

1. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should handle user interaction', () => {
     // Arrange
     const mockHandler = jest.fn();
     render(<Component onAction={mockHandler} />);
     
     // Act
     fireEvent.click(screen.getByRole('button'));
     
     // Assert
     expect(mockHandler).toHaveBeenCalledWith(expectedArgs);
   });
   ```

2. **Test One Thing at a Time**
   ```typescript
   // ✅ Good: Single responsibility
   it('renders title correctly', () => {
     render(<Component title="Test" />);
     expect(screen.getByText('Test')).toBeInTheDocument();
   });

   it('calls onSave when form is submitted', () => {
     const onSave = jest.fn();
     render(<Component onSave={onSave} />);
     fireEvent.click(screen.getByText('Save'));
     expect(onSave).toHaveBeenCalled();
   });

   // ❌ Bad: Multiple responsibilities
   it('renders and handles form submission', () => {
     // Too many assertions in one test
   });
   ```

3. **Use Descriptive Test Names**
   ```typescript
   // ✅ Good: Clear and descriptive
   it('displays error message when API call fails', () => { /* ... */ });
   it('shows loading spinner while fetching data', () => { /* ... */ });
   it('filters results when search query is provided', () => { /* ... */ });

   // ❌ Bad: Vague and unclear
   it('works correctly', () => { /* ... */ });
   it('handles the thing', () => { /* ... */ });
   ```

### Performance Testing

1. **Test Component Performance**
   ```typescript
   it('renders large lists efficiently', () => {
     const largeData = Array.from({ length: 1000 }, (_, i) => ({
       id: i,
       title: `Item ${i}`,
     }));

     const startTime = performance.now();
     render(<ListComponent items={largeData} />);
     const endTime = performance.now();

     expect(endTime - startTime).toBeLessThan(100); // 100ms threshold
   });
   ```

2. **Test API Performance**
   ```typescript
   it('handles concurrent requests efficiently', async () => {
     const requests = Array.from({ length: 50 }, () =>
       fetch('/api/posts')
     );

     const startTime = performance.now();
     await Promise.all(requests);
     const endTime = performance.now();

     expect(endTime - startTime).toBeLessThan(2000); // 2s threshold
   });
   ```

### Accessibility Testing

1. **Automated Accessibility Testing**
   ```typescript
   import { axe, toHaveNoViolations } from 'jest-axe';

   expect.extend(toHaveNoViolations);

   it('should not have accessibility violations', async () => {
     const { container } = render(<Component />);
     const results = await axe(container);
     expect(results).toHaveNoViolations();
   });
   ```

2. **Manual Accessibility Testing**
   ```typescript
   it('supports keyboard navigation', () => {
     render(<Component />);
     
     const button = screen.getByRole('button');
     button.focus();
     
     fireEvent.keyDown(button, { key: 'Enter' });
     expect(mockHandler).toHaveBeenCalled();
   });
   ```

## Common Patterns

### Form Testing

```typescript
describe('Form Component', () => {
  it('submits form with valid data', async () => {
    const onSubmit = jest.fn();
    render(<Form onSubmit={onSubmit} />);

    // Fill form
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });
  });

  it('shows validation errors for invalid data', async () => {
    render(<Form />);

    // Submit empty form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });
});
```

### Async Operation Testing

```typescript
describe('Async Operations', () => {
  it('handles loading states correctly', async () => {
    const { result } = renderHook(() => useAsyncOperation());

    // Initial loading state
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();

    // Wait for completion
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(expectedData);
  });

  it('handles error states correctly', async () => {
    // Mock API to throw error
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useAsyncOperation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('API Error');
    expect(result.current.data).toBeNull();
  });
});
```

### Integration Testing

```typescript
describe('Component Integration', () => {
  it('integrates with custom hooks correctly', () => {
    const mockHook = jest.fn().mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
    });

    jest.spyOn(hooksModule, 'useCustomHook').mockImplementation(mockHook);

    render(<Component />);

    expect(mockHook).toHaveBeenCalled();
    expect(screen.getByText(mockData.title)).toBeInTheDocument();
  });

  it('integrates with API endpoints correctly', async () => {
    server.use(
      http.get('/api/data', () => {
        return HttpResponse.json({ data: mockData });
      })
    );

    render(<Component />);

    await waitFor(() => {
      expect(screen.getByText(mockData.title)).toBeInTheDocument();
    });
  });
});
```

## Troubleshooting

### Common Issues and Solutions

1. **Async Testing Issues**
   ```typescript
   // ❌ Problem: Test passes before async operation completes
   it('fetches data', () => {
     const { result } = renderHook(() => useCustomHook());
     expect(result.current.data).toEqual(expectedData); // Fails
   });

   // ✅ Solution: Use waitFor
   it('fetches data', async () => {
     const { result } = renderHook(() => useCustomHook());
     await waitFor(() => {
       expect(result.current.data).toEqual(expectedData);
     });
   });
   ```

2. **Mock Cleanup Issues**
   ```typescript
   // ❌ Problem: Mocks persist between tests
   beforeEach(() => {
     jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
   });

   // ✅ Solution: Clean up mocks
   beforeEach(() => {
     jest.clearAllMocks();
   });

   afterEach(() => {
     jest.restoreAllMocks();
   });
   ```

3. **Component Re-render Issues**
   ```typescript
   // ❌ Problem: Component doesn't re-render after state change
   fireEvent.click(button);
   expect(screen.getByText('Updated')).toBeInTheDocument(); // Fails

   // ✅ Solution: Wait for re-render
   fireEvent.click(button);
   await waitFor(() => {
     expect(screen.getByText('Updated')).toBeInTheDocument();
   });
   ```

### Debugging Tips

1. **Use screen.debug()**
   ```typescript
   it('debugs component state', () => {
     render(<Component />);
     screen.debug(); // Shows current DOM state
   });
   ```

2. **Use waitFor with custom timeout**
   ```typescript
   await waitFor(() => {
     expect(element).toBeInTheDocument();
   }, { timeout: 5000 }); // 5 second timeout
   ```

3. **Check for console errors**
   ```typescript
   beforeEach(() => {
     jest.spyOn(console, 'error').mockImplementation(() => {});
   });

   afterEach(() => {
     expect(console.error).not.toHaveBeenCalled();
   });
   ```

## Conclusion

Following these testing patterns and best practices ensures:

- **Reliable Tests**: Tests that accurately reflect component behavior
- **Maintainable Code**: Easy to update and extend tests
- **Good Coverage**: Comprehensive testing of functionality
- **Developer Experience**: Clear, readable, and helpful tests
- **Quality Assurance**: Confidence in code changes and refactoring

Remember to adapt these patterns to your specific use cases while maintaining consistency across the codebase. 