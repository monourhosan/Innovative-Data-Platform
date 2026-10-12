import { getSubmissionById, updateSubmissionStatus } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const submission = await getSubmissionById(id);
    if (!submission) {
      return NextResponse.json({ success: false, error: 'Submission record not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: submission });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!['verified', 'pending', 'flagged', 'rejected'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid verification status' }, { status: 400 });
    }

    const updated = await updateSubmissionStatus(id, status);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Submission record not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
