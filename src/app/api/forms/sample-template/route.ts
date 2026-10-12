import { generateSampleXlsFormBuffer } from '@/lib/xlsx-parser';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const buffer = generateSampleXlsFormBuffer();

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="IDP_Sample_XLSForm_Template.xlsx"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
