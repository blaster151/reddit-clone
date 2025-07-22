# TODOs for Reddit Clone

## Frontend
- [x] Create a Post creation form component
- [x] Create a Comment form component
- [x] Implement a Post list/feed component
- [x] Implement a Comment thread component
- [x] Add upvote/downvote button logic to PostCard
- [x] Add upvote/downvote button logic to Comment
- [x] Create Subreddit sidebar component
- [Dev 1] Add user authentication UI (login/register forms)
- [Dev 1] Add user profile page
- [Dev 1] Add subreddit page (list posts by subreddit)
- [Dev 1] Add post detail page (show post + comments)
- [Dev 1] Add loading and error states to components
- [Dev 1] Add pagination or infinite scroll to post feed
- [Dev 1] Integrate useVotes hook into PostCard component
- [Dev 1] Integrate useVotes hook into Comment component
- [Dev 1] Add loading states and disabled states for vote buttons
- [Dev 1] Add vote count animations and visual feedback
- [Dev 1] Fix Jest configuration for React component testing
- [Dev 1] Add proper error boundaries and loading states
- [Dev 1] Implement search functionality with filters
- [Dev 1] Add mobile responsiveness improvements
- [Dev 1] Implement user notifications system
- [Dev 1] Add keyboard navigation and accessibility features

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
- [Dev 2] Integrate persistent storage (Prisma + PostgreSQL) for comments, votes, and subreddits
- [Dev 2] Implement user authentication and session management (NextAuth.js or similar)
- [Dev 2] Add rate limiting and brute-force protection to voting and comment APIs
- [Dev 2] Implement API endpoints for fetching individual comments and comment threads (nested replies)
- [Dev 2] Add API endpoints for editing and deleting comments (with permission checks)
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
- [Dev 2] Add API endpoints and UI for notifications (mentions, replies, mod actions)
- [Dev 2] Implement optimistic UI updates for voting and commenting in the frontend

## State Management & Hooks
- [x] Create custom hook for submitting votes
- [Dev 1] Create custom hook for authentication state
- [Dev 1] Create custom hook for fetching comments
- [Dev 1] Create custom hook for user vote history
- [Dev 1] Create custom hook for trending posts/comments
- [Dev 1] Create custom hook for search functionality
- [Dev 1] Create custom hook for real-time notifications
- [Dev 1] Create custom hook for user preferences

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
- [Dev 2] Add tests for API error cases (invalid input, server errors)
- [Dev 2] Add tests for vote analytics and trending algorithms
- [Dev 2] Add tests for search functionality
- [Dev 2] Add tests for real-time features
- [Dev 2] Add performance tests for high-traffic scenarios

## Miscellaneous
- [x] Add error boundary component
- [x] Add 404 and error pages
- [Dev 1] Add SEO meta tags to pages
- [Dev 1] Add favicon and branding
- [Dev 1] Add README instructions for setup and contribution
- [Dev 1] Implement progressive web app (PWA) features
- [Dev 1] Add dark mode support
- [Dev 1] Implement internationalization (i18n)
- [Dev 1] Add analytics and user behavior tracking

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
[Dev 1] Add vote count animations and visual feedback
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