# Reddit Clone Documentation

Welcome to the comprehensive documentation for the Reddit Clone project! This documentation provides detailed information about all components, hooks, utilities, and API routes used in the application.

## 🚀 Quick Start

The Reddit Clone is a modern, full-stack web application built with Next.js, TypeScript, and React. It provides a complete Reddit-like experience with posts, comments, voting, user authentication, and more.

### Key Features

- **📝 Posts & Comments**: Create, read, and interact with posts and comments
- **👍 Voting System**: Upvote and downvote posts and comments with optimistic updates
- **🔍 Search**: Full-text search with filters and real-time results
- **👥 User Authentication**: Secure login, registration, and session management
- **🏷️ Subreddits**: Create and join communities
- **🛡️ Moderation**: Comprehensive moderation tools for community management
- **📊 Analytics**: User engagement and trending content analytics
- **⚡ Real-time Updates**: Server-Sent Events for live updates

## 📚 Documentation Sections

### Components
Explore the React components that make up the user interface:

- **UI Components**: Button, Input, LoadingSpinner, Skeleton
- **Layout Components**: PostCard, Comment, SearchBar, AuthUI
- **Page Components**: PostFeed, CommentThread, SubredditPage, UserProfile
- **Form Components**: CreatePostForm, CommentForm

### Hooks
Learn about the custom React hooks that manage application state:

- **useAuth**: User authentication and session management
- **usePosts**: Post data fetching and management
- **useComments**: Comment data and CRUD operations
- **useVotes**: Voting functionality with optimistic updates
- **useSearch**: Search functionality with debouncing and filters

### API Routes
Discover the Next.js API routes that power the backend:

- **Posts**: Create, read, and manage posts
- **Comments**: Comment creation and thread management
- **Votes**: Voting system implementation
- **Authentication**: Login, registration, and session management
- **Search**: Full-text search API
- **Analytics**: User engagement and trending data
- **Moderation**: Community moderation tools

### Utilities
Explore the utility functions and helpers:

- **Formatting**: Date, time, and number formatting utilities
- **Validation**: Input sanitization and validation
- **Styling**: CSS class merging and Tailwind utilities
- **Error Handling**: Centralized error management

## 🛠️ Technology Stack

### Frontend
- **Next.js 15**: React framework with SSR and API routes
- **React 19**: UI library for building interactive components
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation for forms and API

### Backend
- **Next.js API Routes**: Server-side API endpoints
- **Prisma**: Database ORM and schema management
- **PostgreSQL**: Primary database (configurable)
- **Server-Sent Events**: Real-time updates

### Testing
- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **MSW**: API mocking for integration tests
- **jest-axe**: Accessibility testing

### Development Tools
- **ESLint**: Code linting and quality enforcement
- **Prettier**: Code formatting
- **JSDoc**: Documentation generation

## 🎯 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL (optional, can use SQLite for development)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/reddit-clone.git
cd reddit-clone

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Documentation
npm run docs:generate # Generate documentation
npm run docs:serve   # Serve documentation locally
npm run docs:build   # Build documentation for deployment

# Code Quality
npm run lint         # Run ESLint
```

## 📖 Usage Examples

### Creating a Post

```tsx
import { CreatePostForm } from '@/components/create-post-form';

function NewPostPage() {
  return (
    <div>
      <h1>Create New Post</h1>
      <CreatePostForm 
        subredditId="programming"
        onSuccess={(post) => {
          console.log('Post created:', post);
          // Navigate to the new post
        }}
      />
    </div>
  );
}
```

### Using the Search Hook

```tsx
import { useSearch } from '@/hooks/useSearch';

function SearchPage() {
  const { query, setQuery, results, loading, filters, updateFilters } = useSearch();

  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
        placeholder="Search posts and comments..." 
      />
      
      {loading && <div>Searching...</div>}
      
      {results.map(result => (
        <SearchResult key={result.id} result={result} />
      ))}
    </div>
  );
}
```

### API Route Example

```typescript
// GET /api/posts
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  
  // Fetch posts from database
  const posts = await prisma.post.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: { author: true, subreddit: true }
  });
  
  return NextResponse.json({
    posts,
    page,
    pageSize,
    total: await prisma.post.count(),
    totalPages: Math.ceil(await prisma.post.count() / pageSize)
  });
}
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/reddit_clone"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# API Keys (optional)
REDDIT_API_KEY="your-reddit-api-key"
```

### Database Schema

The application uses Prisma for database management. Key models include:

- **User**: User accounts and profiles
- **Post**: Posts with titles, content, and metadata
- **Comment**: Comments with nested reply support
- **Vote**: User votes on posts and comments
- **Subreddit**: Communities and their settings
- **Moderator**: Community moderation relationships

## 🧪 Testing

The project includes comprehensive testing coverage:

### Component Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PostCard } from '@/components/post-card';

describe('PostCard', () => {
  it('renders post information correctly', () => {
    const mockPost = {
      id: '1',
      title: 'Test Post',
      content: 'Test content',
      // ... other properties
    };

    render(<PostCard post={mockPost} />);
    
    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
});
```

### API Testing

```tsx
import { GET } from '@/app/api/posts/route';
import { NextRequest } from 'next/server';

describe('GET /api/posts', () => {
  it('returns paginated posts', async () => {
    const req = new NextRequest('http://localhost/api/posts?page=1&pageSize=5');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data.posts)).toBe(true);
    expect(data.page).toBe(1);
    expect(data.pageSize).toBe(5);
  });
});
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Update documentation
6. Submit a pull request

### Development Guidelines

- Follow TypeScript strict mode
- Write comprehensive tests
- Use JSDoc for documentation
- Follow the established code style
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you need help or have questions:

- 📖 Check the documentation sections below
- 🐛 Report bugs in the GitHub issues
- 💬 Join our community discussions
- 📧 Contact the maintainers

---

**Happy coding! 🎉**

Explore the documentation sections below to learn more about specific components, hooks, and API routes. 