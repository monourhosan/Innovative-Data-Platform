import { getAuthenticatedUser } from '@/lib/auth';
import { getUserById } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const auth = getAuthenticatedUser(req);
  if (!auth) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  const user = await getUserById(auth.userId);
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 404 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      phone: user.phone,
      status: user.status,
    },
  });
}
