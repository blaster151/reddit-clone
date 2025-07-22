import { NextRequest, NextResponse } from 'next/server';
import { createUserSchema } from '@/lib/validation';
import { ZodError } from 'zod';

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