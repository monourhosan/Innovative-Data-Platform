import { deleteSupervisor, getSupervisorById } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supervisor = await getSupervisorById(id);
    if (!supervisor) {
      return NextResponse.json({ success: false, error: 'Supervisor not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: supervisor });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteSupervisor(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Supervisor not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Supervisor removed successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
