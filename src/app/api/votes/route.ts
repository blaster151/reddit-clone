import { NextRequest, NextResponse } from 'next/server';
import { voteSchemaInput } from '@/lib/validation';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Validate input
    const validated = voteSchemaInput.parse(body);
    // In a real app, validate and save to DB
    const vote = {
      id: Math.random().toString(36).slice(2),
      userId: validated.userId,
      targetId: validated.targetId,
      targetType: validated.targetType, // 'post' or 'comment'
      voteType: validated.voteType,     // 'upvote' or 'downvote'
      createdAt: new Date().toISOString(),
    };
    return NextResponse.json({ vote }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
} 