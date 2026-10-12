import { hashPassword } from '@/lib/auth';
import { createSupervisor, getSupervisors } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const supervisors = await getSupervisors();
    return NextResponse.json({ success: true, count: supervisors.length, data: supervisors });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, username, password, assigned_project, created_by } = body;

    if (!name || !email || !username || !password || !assigned_project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Required fields missing: name, email, username, password, and assigned_project are mandatory.',
        },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newSupervisor = await createSupervisor({
      name,
      email,
      phone: phone || '',
      username,
      password_hash: hashedPassword,
      assigned_project,
      created_by: created_by || 'admin',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Supervisor account successfully created and provisioned with credentials.',
        data: newSupervisor,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
