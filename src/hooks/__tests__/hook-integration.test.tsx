import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { useComments } from '../useComments';
import { AuthUI } from '@/components/auth-ui';
import { CommentThread } from '@/components/comment-thread';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock the hooks
jest.mock('../useAuth');
jest.mock('../useComments');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseComments = useComments as jest.MockedFunction<typeof useComments>;

describe('Hook Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockUseAuth.mockClear();
    mockUseComments.mockClear();
  });

  describe('AuthUI with useAuth Integration', () => {
    const mockUser = {
      id: 'user-1',
      username: 'testuser',
      email: 'test@example.com',
      karma: 100,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    it('should handle login flow with useAuth', async () => {
      const mockLogin = jest.fn();
      const mockRegister = jest.fn();
      const mockLogout = jest.fn();

      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        login: mockLogin,
        register: mockRegister,
        logout: mockLogout,
        refreshUser: jest.fn(),
        clearError: jest.fn(),
      });

      render(<AuthUI />);

      // Switch to login mode
      const loginTab = screen.getByText(/login/i);
      fireEvent.click(loginTab);

      // Fill login form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should handle registration flow with useAuth', async () => {
      const mockLogin = jest.fn();
      const mockRegister = jest.fn();
      const mockLogout = jest.fn();

      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        login: mockLogin,
        register: mockRegister,
        logout: mockLogout,
        refreshUser: jest.fn(),
        clearError: jest.fn(),
      });

      render(<AuthUI />);

      // Switch to register mode
      const registerTab = screen.getByText(/register/i);
      fireEvent.click(registerTab);

      // Fill registration form
      const usernameInput = screen.getByLabelText(/username/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      fireEvent.change(usernameInput, { target: { value: 'newuser' } });
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          username: 'newuser',
          email: 'new@example.com',
          password: 'password123',
        });
      });
    });

    it('should show loading state during authentication', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
        clearError: jest.fn(),
      });

      render(<AuthUI />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should show error state from useAuth', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Invalid credentials',
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
        clearError: jest.fn(),
      });

      render(<AuthUI />);

      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    it('should show authenticated state', () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
        clearError: jest.fn(),
      });

      render(<AuthUI />);

      expect(screen.getByText('Welcome, testuser!')).toBeInTheDocument();
    });
  });

  describe('CommentThread with useComments Integration', () => {
    const mockComment = {
      id: 'comment-1',
      content: 'Test comment',
      authorId: 'user-1',
      postId: 'post-1',
      upvotes: 5,
      downvotes: 1,
      isRemoved: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    it('should fetch comments on mount', async () => {
      const mockFetchComments = jest.fn();
      const mockCreateComment = jest.fn();
      const mockUpdateComment = jest.fn();
      const mockDeleteComment = jest.fn();

      mockUseComments.mockReturnValue({
        comments: [mockComment],
        isLoading: false,
        error: null,
        hasMore: false,
        page: 1,
        fetchComments: mockFetchComments,
        createComment: mockCreateComment,
        updateComment: mockUpdateComment,
        deleteComment: mockDeleteComment,
        loadMore: jest.fn(),
        refreshComments: jest.fn(),
      });

             render(<CommentThread postId="post-1" fetchComments={jest.fn()} />);

       await waitFor(() => {
         expect(mockFetchComments).toHaveBeenCalledWith({
           postId: 'post-1',
           page: 1,
           pageSize: 10,
           sortBy: 'new',
         });
       });
     });

     it('should show loading state from useComments', () => {
       mockUseComments.mockReturnValue({
         comments: [],
         isLoading: true,
         error: null,
         hasMore: false,
         page: 1,
         fetchComments: jest.fn(),
         createComment: jest.fn(),
         updateComment: jest.fn(),
         deleteComment: jest.fn(),
         loadMore: jest.fn(),
         refreshComments: jest.fn(),
       });

       render(<CommentThread postId="post-1" fetchComments={jest.fn()} />);

       expect(screen.getByText(/loading comments/i)).toBeInTheDocument();
     });

     it('should show error state from useComments', () => {
       mockUseComments.mockReturnValue({
         comments: [],
         isLoading: false,
         error: 'Failed to fetch comments',
         hasMore: false,
         page: 1,
         fetchComments: jest.fn(),
         createComment: jest.fn(),
         updateComment: jest.fn(),
         deleteComment: jest.fn(),
         loadMore: jest.fn(),
         refreshComments: jest.fn(),
       });

       render(<CommentThread postId="post-1" fetchComments={jest.fn()} />);

       expect(screen.getByText('Failed to fetch comments')).toBeInTheDocument();
     });

     it('should display comments from useComments', () => {
       mockUseComments.mockReturnValue({
         comments: [mockComment],
         isLoading: false,
         error: null,
         hasMore: false,
         page: 1,
         fetchComments: jest.fn(),
         createComment: jest.fn(),
         updateComment: jest.fn(),
         deleteComment: jest.fn(),
         loadMore: jest.fn(),
         refreshComments: jest.fn(),
       });

       render(<CommentThread postId="post-1" fetchComments={jest.fn()} />);

       expect(screen.getByText('Test comment')).toBeInTheDocument();
     });

     it('should handle load more functionality', async () => {
       const mockLoadMore = jest.fn();
       
       mockUseComments.mockReturnValue({
         comments: [mockComment],
         isLoading: false,
         error: null,
         hasMore: true,
         page: 1,
         fetchComments: jest.fn(),
         createComment: jest.fn(),
         updateComment: jest.fn(),
         deleteComment: jest.fn(),
         loadMore: mockLoadMore,
         refreshComments: jest.fn(),
       });

       render(<CommentThread postId="post-1" fetchComments={jest.fn()} />);

       const loadMoreButton = screen.getByText(/load more/i);
       fireEvent.click(loadMoreButton);

       expect(mockLoadMore).toHaveBeenCalled();
     });
   });

   describe('Hook State Synchronization', () => {
     it('should handle multiple hooks updating simultaneously', async () => {
       const mockLogin = jest.fn();
       const mockFetchComments = jest.fn();

       mockUseAuth.mockReturnValue({
         user: null,
         isAuthenticated: false,
         isLoading: false,
         error: null,
         login: mockLogin,
         register: jest.fn(),
         logout: jest.fn(),
         refreshUser: jest.fn(),
         clearError: jest.fn(),
       });

       mockUseComments.mockReturnValue({
         comments: [],
         isLoading: false,
         error: null,
         hasMore: false,
         page: 1,
         fetchComments: mockFetchComments,
         createComment: jest.fn(),
         updateComment: jest.fn(),
         deleteComment: jest.fn(),
         loadMore: jest.fn(),
         refreshComments: jest.fn(),
       });

       // Render both components
       render(
         <div>
           <AuthUI />
           <CommentThread postId="post-1" fetchComments={jest.fn()} />
         </div>
       );

       // Both hooks should be called
       expect(mockFetchComments).toHaveBeenCalled();
     });
   });
}); 