import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';

const unsubscribeSchema = z.object({
  subredditId: z.string().min(1),
  userId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = unsubscribeSchema.parse(body);
    // In a real app, remove subscription from DB
    return NextResponse.json({ success: true, subredditId: validated.subredditId, userId: validated.userId }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
} 