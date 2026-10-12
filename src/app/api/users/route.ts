import { hashPassword } from '@/lib/auth';
import { createUser, getUsers } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const users = await getUsers();
    // Exclude password_hash for safety
    const safeUsers = users.map(({ password_hash, ...rest }) => rest);
    return NextResponse.json({ success: true, count: safeUsers.length, data: safeUsers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, username, password, role, status } = body;

    if (!name || !email || !username || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Name, email, username, password, and role are required.' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await createUser({
      name,
      email,
      phone: phone || '',
      username,
      password_hash: hashedPassword,
      role,
      status: status || 'active',
    });

    const { password_hash, ...safeUser } = newUser;
    return NextResponse.json({ success: true, data: safeUser }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
