import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  // In a real app, fetch notifications from DB
  if (userId === 'user-1') {
    const notifications = [
      { id: 'notif-1', type: 'mention', message: 'You were mentioned in a comment', read: false },
      { id: 'notif-2', type: 'reply', message: 'Someone replied to your post', read: false },
      { id: 'notif-3', type: 'mod', message: 'Your post was removed by a moderator', read: true },
    ];
    return NextResponse.json({ notifications }, { status: 200 });
  }
  return NextResponse.json({ notifications: [] }, { status: 200 });
} 