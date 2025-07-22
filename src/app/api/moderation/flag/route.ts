import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';

const flagSchema = z.object({
  targetId: z.string().min(1),
  targetType: z.enum(['post', 'comment']),
  userId: z.string().min(1),
  reason: z.string().min(3),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = flagSchema.parse(body);
    // In a real app, save flag to DB
    return NextResponse.json({ success: true, ...validated }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
} 