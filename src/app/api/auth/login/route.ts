import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';

/**
 * Zod schema for validating login request data.
 * Ensures email is valid and password meets minimum length requirements.
 */
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/**
 * POST /api/auth/login
 * 
 * Authenticates a user with email and password credentials.
 * Validates input using Zod schema and returns user data on successful authentication.
 * 
 * @param req - NextRequest object containing the login credentials in the request body
 * @param req.body - JSON object containing login data
 * @param req.body.email - The user's email address (required, must be valid email format)
 * @param req.body.password - The user's password (required, minimum 8 characters)
 * 
 * @example
 * ```typescript
 * // Login with valid credentials
 * const response = await fetch('/api/auth/login', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     email: 'user@example.com',
 *     password: 'securepassword123'
 *   })
 * });
 * ```
 * 
 * @returns Promise<NextResponse> - JSON response with authentication result
 * 
 * @response
 * ```json
 * {
 *   "success": true,
 *   "user": {
 *     "email": "user@example.com"
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
    const validated = loginSchema.parse(body);
    // In a real app, check credentials against DB
    return NextResponse.json({ success: true, user: { email: validated.email } }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
} 