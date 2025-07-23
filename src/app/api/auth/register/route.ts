import { NextRequest, NextResponse } from 'next/server';
import { createUserSchema } from '@/lib/validation';
import { ZodError } from 'zod';

/**
 * POST /api/auth/register
 * 
 * Registers a new user with the provided account information.
 * Validates input using createUserSchema and creates a new user account.
 * 
 * @param req - NextRequest object containing the registration data in the request body
 * @param req.body - JSON object containing user registration data
 * @param req.body.username - The desired username (required, validated by createUserSchema)
 * @param req.body.email - The user's email address (required, must be valid email format)
 * @param req.body.password - The user's password (required, minimum 8 characters)
 * 
 * @example
 * ```typescript
 * // Register a new user
 * const response = await fetch('/api/auth/register', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     username: 'newuser123',
 *     email: 'newuser@example.com',
 *     password: 'securepassword123'
 *   })
 * });
 * ```
 * 
 * @returns Promise<NextResponse> - JSON response with the created user data
 * 
 * @response
 * ```json
 * {
 *   "user": {
 *     "id": "user123",
 *     "username": "newuser123",
 *     "email": "newuser@example.com",
 *     "karma": 0,
 *     "createdAt": "2024-01-01T10:00:00.000Z",
 *     "updatedAt": "2024-01-01T10:00:00.000Z"
 *   }
 * }
 * ```
 * 
 * @throws {ZodError} - If validation fails (400 Bad Request)
 * @throws {Error} - If there's an internal server error (500 Internal Server Error)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createUserSchema.parse(body);
    // In a real app, hash password and save to DB
    const user = {
      id: Math.random().toString(36).slice(2),
      username: validated.username,
      email: validated.email,
      karma: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
} 