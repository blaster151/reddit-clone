# TODOs for Reddit Clone

## Frontend
- [x] Create a Post creation form component
- [x] Create a Comment form component
- [x] Implement a Post list/feed component
- [x] Implement a Comment thread component
- [x] Add upvote/downvote button logic to PostCard
- [x] Add upvote/downvote button logic to Comment
- [x] Create Subreddit sidebar component
- [x] Add user authentication UI (login/register forms)
- [x] Add user profile page
- [x] Add subreddit page (list posts by subreddit)
- [x] Add post detail page (show post + comments)
- [x] Add loading and error states to components
- [x] Add pagination or infinite scroll to post feed
- [x] Integrate useVotes hook into PostCard component
- [x] Integrate useVotes hook into Comment component
- [x] Add loading states and disabled states for vote buttons
- [x] Add vote count animations and visual feedback
- [x] Fix Jest configuration for React component testing
- [x] Add proper error boundaries and loading states
- [x] Implement search functionality with filters
- [Dev 2] Add mobile responsiveness improvements
- [Dev 2] Implement user notifications system
- [Dev 2] Add keyboard navigation and accessibility features

## Backend/API
- [Dev 2] Scaffold API route for creating comments
- [Dev 2] Scaffold API route for fetching comments
- [Dev 2] Scaffold API route for voting (posts/comments)
- [Dev 2] Scaffold API route for user registration
- [Dev 2] Scaffold API route for user login
- [Dev 2] Scaffold API route for creating subreddits
- [Dev 2] Scaffold API route for fetching subreddit info
- [Dev 2] Implement persistent storage for posts (database integration)
- [Dev 2] Add API input validation with Zod schemas
- [Dev 2] Handle API errors with proper status codes and messages
- [Dev 2] Implement vote persistence and user vote history
- [Dev 2] Add vote analytics and trending algorithms
- [Dev 2] Create vote moderation tools and anti-abuse measures
- [Dev 2] Implement real-time updates with WebSocket
- [Dev 2] Add search API with full-text search capabilities
- [Dev 2] Implement user notification system
- [Dev 2] Add rate limiting and API throttling
- [Dev 2] Implement caching strategy for frequently accessed data

## Validation & Types
- [x] Add Zod validation to all new and existing API routes (comments, votes, subreddits, auth)
- [x] Add centralized error handling middleware/util for consistent API error responses
- [x] Integrate persistent storage (Prisma + PostgreSQL) for comments, votes, and subreddits
- [Dev 2] Implement user authentication and session management (NextAuth.js or similar)
- [Dev 2] Add rate limiting and brute-force protection to voting and comment APIs
- [x] Implement API endpoints for fetching individual comments and comment threads (nested replies)
- [x] Add API endpoints for editing and deleting comments (with permission checks)
- [x] Add integration tests for user registration and login flows
- [x] Add integration tests for subreddit creation and fetching flows
- [x] Add integration tests for subscribing/unsubscribing to subreddits
- [x] Add API endpoints for fetching user profiles and user activity (posts, comments, votes)
- [Dev 2] Add API endpoints for fetching user profiles and user activity (posts, comments, votes)
- [x] Implement moderation tools: comment/report flagging, comment removal, and user bans
- [x] Add real-time updates for comments and votes using WebSockets or server-sent events
- [x] Implement full-text search for posts and comments (API and frontend)
- [x] Add analytics endpoints for trending posts, top subreddits, and user engagement
- [Dev 2] Add analytics endpoints for trending posts, top subreddits, and user engagement
- [x] Implement caching for frequently accessed API endpoints (e.g., posts, subreddits)
- [x] Add accessibility tests for all interactive components (buttons, forms, modals)
- [x] Refactor API route tests to use MSW (Mock Service Worker) for more realistic integration testing
- [x] Add API endpoints and UI for notifications (mentions, replies, mod actions)
- [x] Implement optimistic UI updates for voting and commenting in the frontend

## State Management & Hooks
- [x] Create custom hook for submitting votes
- [x] Create custom hook for authentication state
- [x] Create custom hook for fetching comments
- [Dev 3] Create custom hook for user vote history
- [Dev 3] Create custom hook for trending posts/comments
- [x] Create custom hook for search functionality
- [Dev 3] Create custom hook for real-time notifications
- [Dev 3] Create custom hook for user preferences

## Testing
- [x] Add unit tests for PostCard component
- [x] Add unit tests for Button component
- [x] Add unit tests for Comment component
- [x] Add unit tests for API route handlers
- [x] Add integration tests for post creation flow
- [x] Add integration tests for comment creation flow
- [x] Add integration tests for voting flow
- [Dev 2] Add E2E tests for user registration/login
- [Dev 2] Add E2E tests for posting/commenting/voting
- [x] Add tests for API error cases (invalid input, server errors)
- [x] Add tests for vote analytics and trending algorithms
- [x] Add tests for search functionality
- [x] Add tests for real-time features
- [x] Add performance tests for high-traffic scenarios

### Critical Missing Tests (High Priority)
- [Dev 2] Add performance and memory leak tests for hooks and components
- [Dev 3] Add error boundary integration tests with real components
- [Dev 2] Add search system integration tests (SearchBar + SearchResults)
- [Dev 2] Add comprehensive API error handling tests (network failures, timeouts, retries)
- [Dev 2] Add accessibility integration tests (keyboard navigation, screen readers)
- [Dev 2] Add state management edge case tests (concurrent updates, race conditions)

### Advanced Testing (Medium Priority)
- [Dev 2] Add component composition tests (complex hierarchies, prop drilling)
- [Dev 2] Add visual regression tests (snapshots, responsive design)
- [Dev 2] Add internationalization tests (translations, RTL layouts)
- [Dev 2] Add end-to-end user flow tests (complete user journeys)
- [Dev 2] Add load testing for critical user paths
- [Dev 2] Add security testing (XSS, CSRF, input validation)

## Miscellaneous
- [x] Add error boundary component
- [x] Add 404 and error pages
- [Dev 2] Add SEO meta tags to pages
- [Dev 2] Add favicon and branding
- [Dev 2] Add README instructions for setup and contribution
- [Dev 2] Implement progressive web app (PWA) features
- [Dev 2] Add dark mode support
- [Dev 2] Implement internationalization (i18n)
- [Dev 2] Add analytics and user behavior tracking

Authentication & User Management (M1 Core):
- [Dev 2] Implement NextAuth.js v4 with credentials provider
- [Dev 2] Set up user registration form with email/password
- [Dev 2] Implement email verification flow for new accounts
- [Dev 2] Add password reset functionality via email
- [Dev 2] Create user session management and protected routes
- [Dev 2] Add rate limiting for registration/login attempts
- Database & Data Layer (M1 Foundation):
- [Dev 2] Set up PostgreSQL database with Prisma ORM
- [Dev 2] Create database schema for users, posts, comments, votes, communities
- [Dev 2] Implement database migrations and seeding
- [Dev 2] Add database connection pooling and error handling
- Post Detail & Navigation (M1 Core):
- [Dev 1] Create individual post detail page with dynamic routing (/posts/[id])
- [Dev 1] Implement post detail page with full post content and metadata
- [Dev 1] Add breadcrumb navigation from feed to post detail
- [Dev 1] Create post sharing functionality (copy link, social share)
- Comment System (M1 Core):
- [Dev 1] Implement nested comment threading (replies to replies)
- [Dev 1] Add comment sorting options (new, top, controversial)
- [Dev 1] Create comment collapse/expand functionality for long threads
- [Dev 1] Add comment pagination or "load more" for posts with many comments
- Community Structure (M1 Foundation):
- [Dev 1] Create basic subreddit/community pages with filtering
- [Dev 1] Implement community sidebar with description and moderator info

Feed & Content Display (M1 Core):
[Dev 1] Implement feed sorting options (New, Top, Hot, Rising)
[Dev 1] Add feed pagination or infinite scroll for large post lists
[Dev 1] Create empty state UI for feeds with no posts
[Dev 1] Add post preview truncation for long content in feed view
[Dev 1] Implement post metadata display (author, timestamp, comment count)
Voting System Integration (M1 Core):
[Dev 1] Connect useVotes hook to PostCard voting buttons
[x] Add vote count animations and visual feedback
[Dev 1] Implement vote persistence to database
[Dev 1] Add vote validation (prevent double voting, track user votes)
[Dev 1] Create vote analytics and trending algorithms
User Experience & Navigation (M1 Polish):
[Dev 1] Add loading states for all async operations (posts, comments, votes)
[Dev 1] Implement optimistic UI updates for better perceived performance
[Dev 1] Create responsive design for mobile devices
[Dev 1] Add keyboard navigation support for accessibility
[Dev 1] Implement proper focus management for forms and modals
Content Management (M1 Core):
[Dev 1] Add post editing functionality for authors
[Dev 1] Implement post deletion with confirmation
[Dev 1] Create comment editing and deletion features
[Dev 1] Add content moderation flags (report inappropriate content)
[Dev 1] Implement content validation and sanitization

# Additional Backend/API (Dev 2)
- [x] Add pagination and filtering to posts and comments API endpoints
- [Dev 2] Implement soft deletion for posts and comments (with undo)
- [Dev 2] Add audit logging for moderation actions (flag, remove, ban)
- [Dev 2] Implement email notifications for mentions, replies, and mod actions
- [Dev 2] Add API endpoint for user settings/preferences (notifications, theme, etc.)
- [Dev 2] Add API endpoint for reporting bugs/feedback

# Additional Frontend (Dev 1)
- [Dev 1] Implement infinite scroll and pagination UI for post and comment feeds
- [Dev 1] Add optimistic UI for comment creation and editing
- [Dev 1] Add user settings/preferences UI (notifications, theme, etc.)
- [Dev 1] Implement post and comment editing UI with validation
- [Dev 1] Add undo UI for soft-deleted posts/comments
- [Dev 1] Add bug/feedback reporting UI
- [Dev 2] Add toast notifications for success/error actions
- [Dev 2] Add skeleton loaders and shimmer effects for feeds
- [Dev 2] Implement keyboard shortcuts for common actions (e.g., upvote, reply)
- [Dev 2] Add accessibility improvements for modals and dropdowns
- [Dev 3] Add user onboarding flow and welcome tour
- [Dev 3] Add profile editing UI (avatar, bio, etc.)

## Architecture
- [x] Implement Zustand for global state and to reduce prop drilling
- [Dev 3] Implement keyboard navigation sitewide
- [Dev 3] Add comprehensive ARIA labels

# Additional TODOs (Emerging from Current State)

## Zustand Store Integration & Optimization
- [Dev 1] Integrate Zustand store with all existing components (CommentThread, SubredditPage, PostDetailPage, etc.)
- [Dev 1] Create useCommentsWithStore hook similar to usePostsWithStore for comment state management
- [Dev 1] Implement store persistence for user preferences and theme settings
- [Dev 1] Add store selectors for better performance (memoized selectors)
- [Dev 1] Implement store middleware for logging and debugging
- [Dev 1] Add store hydration handling for SSR compatibility
- [Dev 1] Create store slices for better organization (separate stores for different domains)

## Missing Hook Implementations
- [Dev 3] Implement useAuth hook for authentication state management
- [Dev 3] Create useComments hook for comment fetching and management
- [Dev 3] Implement useUserVoteHistory hook for tracking user voting patterns
- [Dev 3] Create useTrendingPosts hook for trending content
- [Dev 3] Implement useRealTimeNotifications hook for live notifications
- [Dev 3] Create useUserPreferences hook for user settings management

## Component Integration & Refactoring
- [Dev 1] Refactor PostFeed to use Zustand store instead of local state
- [Dev 1] Update CommentThread to use store-based comment management
- [Dev 1] Integrate store-based search functionality across all components
- [Dev 1] Implement store-based notification system in UI components
- [Dev 1] Add store-based theme switching across all components
- [Dev 1] Create store-based sidebar state management

## Performance & Optimization
- [Dev 1] Implement React.memo for expensive components (PostCard, CommentCard)
- [Dev 1] Add virtualization for large post/comment lists
- [Dev 1] Implement lazy loading for images and media content
- [Dev 1] Add service worker for offline functionality and caching
- [Dev 1] Optimize bundle size with dynamic imports and code splitting
- [Dev 1] Implement request deduplication for API calls

## User Experience Enhancements
- [Dev 2] Add toast notification system using store state
- [Dev 2] Implement keyboard shortcuts for common actions
- [Dev 2] Add drag-and-drop functionality for post reordering
- [Dev 2] Create infinite scroll with intersection observer
- [Dev 2] Add smooth transitions and animations between states
- [Dev 2] Implement progressive loading for images and content

## Testing & Quality Assurance
- [Dev 1] Add integration tests for Zustand store with components
- [Dev 1] Create performance tests for store operations
- [Dev 2] Add accessibility tests for all new components
- [Dev 1] Implement visual regression tests for UI components
- [Dev 1] Add end-to-end tests for critical user flows
- [Dev 1] Create stress tests for high-traffic scenarios

## Documentation & Developer Experience
- [x] Add comprehensive JSDoc comments to all hooks and components
- [Dev 3] Create storybook stories for all UI components
- [Dev 3] Add API documentation with examples
- [Dev 3] Create development setup guide
- [Dev 3] Add contribution guidelines and code standards
- [Dev 3] Implement automated changelog generation
- [Dev 3] Add TypeScript strict mode configuration and fix any type issues
- [Dev 3] Create JSDoc documentation for remaining components (AuthUI, SearchBar, SubredditSidebar, etc.)
- [Dev 3] Add JSDoc documentation for API route handlers and middleware
- [Dev 3] Create documentation for testing patterns and best practices
- [Dev 3] Add inline code examples to existing JSDoc comments for better developer experience

## Security & Compliance
- [Dev 2] Add input sanitization for all user-generated content
- [Dev 2] Implement CSRF protection for all forms
- [Dev 2] Add rate limiting for client-side actions
- [Dev 2] Create privacy policy and terms of service pages
- [Dev 2] Implement GDPR compliance features (data export, deletion)
- [Dev 2] Add security headers and CSP configuration