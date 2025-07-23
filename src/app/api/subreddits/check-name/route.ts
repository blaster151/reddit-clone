import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RESERVED_SUBREDDIT_NAMES } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check when auth system is implemented
    // For now, allow name checking without authentication

    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json({ error: 'Name parameter is required' }, { status: 400 });
    }

    // Check if name meets basic requirements
    if (name.length < 3 || name.length > 21) {
      return NextResponse.json({ available: false, error: 'Name must be between 3 and 21 characters' });
    }

    // Check name format (alphanumeric + underscores only)
    const nameRegex = /^[a-zA-Z0-9_]+$/;
    if (!nameRegex.test(name)) {
      return NextResponse.json({ available: false, error: 'Name can only contain letters, numbers, and underscores' });
    }

    // Check for reserved words
    const reservedWords = RESERVED_SUBREDDIT_NAMES;
    if (reservedWords.includes(name.toLowerCase())) {
      return NextResponse.json({ available: false, error: 'This name is reserved and cannot be used' });
    }

    // Check if name already exists (case-insensitive)
    const existingSubreddit = await prisma.subreddit.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    });

    if (existingSubreddit) {
      return NextResponse.json({ available: false, error: 'This community name is already taken' });
    }

    return NextResponse.json({ available: true });

  } catch (error) {
    console.error('Error checking subreddit name availability:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 