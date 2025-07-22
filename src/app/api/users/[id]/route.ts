import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  // In a real app, fetch from DB
  if (id === 'user-123') {
    const user = {
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      karma: 42,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json({ user }, { status: 200 });
  }
  return NextResponse.json({ error: 'User not found' }, { status: 404 });
} 