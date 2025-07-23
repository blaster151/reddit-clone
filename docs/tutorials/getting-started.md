# Getting Started with Reddit Clone

This tutorial will guide you through setting up and running the Reddit Clone project on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
- **npm or yarn**: Package managers (npm comes with Node.js)
- **Git**: Version control system
- **PostgreSQL** (optional): Database (you can use SQLite for development)

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/reddit-clone.git
cd reddit-clone
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all the required dependencies including:

- Next.js and React
- TypeScript and type definitions
- Tailwind CSS for styling
- Testing libraries (Jest, React Testing Library)
- Development tools (ESLint, Prettier)

## Step 3: Environment Setup

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit the `.env.local` file with your configuration:

```env
# Database (use SQLite for development)
DATABASE_URL="file:./dev.db"

# Authentication
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: PostgreSQL for production
# DATABASE_URL="postgresql://user:password@localhost:5432/reddit_clone"
```

## Step 4: Database Setup

Initialize the database:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed the database with sample data
npx prisma db seed
```

## Step 5: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Step 6: Verify Installation

1. Open your browser and navigate to `http://localhost:3000`
2. You should see the Reddit Clone homepage
3. Try creating a new account or logging in
4. Create a test post to verify everything is working

## Project Structure

```
reddit-clone/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/            # API routes
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Homepage
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   └── ...            # Feature components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   └── types/             # TypeScript type definitions
├── prisma/                # Database schema and migrations
├── docs/                  # Documentation
├── tests/                 # Test files
└── package.json           # Project configuration
```

## Available Scripts

### Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

### Testing

```bash
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Documentation

```bash
npm run docs:generate # Generate JSDoc documentation
npm run docs:serve   # Serve documentation locally
npm run docs:build   # Build documentation for deployment
```

### Code Quality

```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors automatically
```

## Next Steps

Now that you have the project running, you can:

1. **Explore the Components**: Check out the components in `src/components/`
2. **Study the Hooks**: Learn about custom hooks in `src/hooks/`
3. **Review API Routes**: Examine the API endpoints in `src/app/api/`
4. **Run Tests**: Execute the test suite to understand functionality
5. **Read Documentation**: Browse the comprehensive documentation

## Troubleshooting

### Common Issues

**Port 3000 already in use:**
```bash
# Kill the process using port 3000
npx kill-port 3000
# Or use a different port
npm run dev -- -p 3001
```

**Database connection issues:**
```bash
# Reset the database
npx prisma migrate reset
npx prisma generate
npx prisma migrate dev
```

**TypeScript errors:**
```bash
# Check TypeScript configuration
npx tsc --noEmit
```

**Dependency issues:**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

If you encounter issues:

1. Check the [GitHub Issues](https://github.com/your-username/reddit-clone/issues)
2. Review the [Documentation](docs/)
3. Run the test suite to verify functionality
4. Check the console for error messages

## Development Workflow

### Making Changes

1. Create a new branch for your feature
2. Make your changes
3. Write tests for new functionality
4. Update documentation if needed
5. Run the test suite
6. Submit a pull request

### Code Style

The project uses:

- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **JSDoc** for documentation

### Testing

Write tests for:

- Component rendering and interactions
- Hook functionality
- API route behavior
- Utility functions

Example test:

```tsx
import { render, screen } from '@testing-library/react';
import { PostCard } from '@/components/post-card';

describe('PostCard', () => {
  it('renders post title', () => {
    const post = { id: '1', title: 'Test Post', content: 'Test content' };
    render(<PostCard post={post} />);
    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });
});
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The project can be deployed to:

- **Netlify**: Static hosting with serverless functions
- **Railway**: Full-stack deployment
- **DigitalOcean**: App Platform
- **AWS**: Elastic Beanstalk or ECS

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Update documentation
6. Submit a pull request

For more information, see the [Contributing Guide](CONTRIBUTING.md).

---

Congratulations! You now have the Reddit Clone project running locally. Explore the codebase, run tests, and start building features! 