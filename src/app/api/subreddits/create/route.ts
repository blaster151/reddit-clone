import { NextRequest, NextResponse } from 'next/server';
import { createSubredditSchema } from '@/lib/validation';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createSubredditSchema.parse(body);
    // In a real app, save to DB
    const subreddit = {
      id: Math.random().toString(36).slice(2),
      name: validated.name,
      description: validated.description,
      creatorId: 'user-123',
      subscriberCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json({ subreddit }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
} 