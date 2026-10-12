import { hashPassword } from '@/lib/auth';
import { createTeamMember, getTeamMembers } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supervisorId = searchParams.get('supervisorId') || undefined;

    const teamMembers = await getTeamMembers(supervisorId);
    return NextResponse.json({ success: true, count: teamMembers.length, data: teamMembers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, username, password, supervisor_id } = body;

    if (!name || !email || !username || !password || !supervisor_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Required fields missing: name, email, username, password, and supervisor_id are mandatory.',
        },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const newTm = await createTeamMember({
      name,
      email,
      phone: phone || '',
      username,
      password_hash: hashedPassword,
      supervisor_id,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Team member account created successfully for field collection.',
        data: newTm,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
