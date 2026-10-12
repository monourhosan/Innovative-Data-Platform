import { getStatistics } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const stats = await getStatistics();
    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
