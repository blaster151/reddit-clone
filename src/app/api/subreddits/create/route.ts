import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { RESERVED_SUBREDDIT_NAMES } from '@/lib/constants';

const createSubredditSchema = z.object({
  name: z.string().min(3).max(21).regex(/^[a-zA-Z0-9_]+$/, 'Name can only contain letters, numbers, and underscores'),
  description: z.string().max(500).optional(),
  type: z.enum(['public', 'private', 'restricted']).default('public'),
  category: z.string().min(1, 'Category is required')
});

export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check when auth system is implemented
    // For now, use a default user ID for demonstration
    const userId = 'default-user-id';

    const body = await request.json();
    
    // Validate input
    const validationResult = createSubredditSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validationResult.error.errors 
      }, { status: 400 });
    }

    const { name, description, type, category } = validationResult.data;

    // Check for reserved words
    const reservedWords = RESERVED_SUBREDDIT_NAMES;
    if (reservedWords.includes(name.toLowerCase())) {
      return NextResponse.json({ error: 'This name is reserved and cannot be used' }, { status: 400 });
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
      return NextResponse.json({ error: 'This community name is already taken' }, { status: 409 });
    }

    // Create the subreddit
    const subreddit = await prisma.subreddit.create({
      data: {
        name: name.toLowerCase(), // Store as lowercase for consistency
        displayName: name, // Keep original case for display
        description: description || '',
        type,
        category,
        creatorId: userId,
        isActive: true
      }
    });

    // Add the creator as a moderator
    await prisma.moderator.create({
      data: {
        userId,
        subredditId: subreddit.id,
        role: 'owner',
        isActive: true
      }
    });

    return NextResponse.json({
      id: subreddit.id,
      name: subreddit.displayName,
      description: subreddit.description,
      type: subreddit.type,
      category: subreddit.category,
      createdAt: subreddit.createdAt
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating subreddit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 