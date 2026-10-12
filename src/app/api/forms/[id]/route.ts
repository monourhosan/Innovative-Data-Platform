import { deleteForm, getFormById } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const form = await getFormById(id);
    if (!form) {
      return NextResponse.json({ success: false, error: 'Survey Form not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: form });
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
    const deleted = await deleteForm(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Survey Form not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Form deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
