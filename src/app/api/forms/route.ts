import { createForm, getForms } from '@/lib/db';
import { parseXlsForm } from '@/lib/xlsx-parser';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId') || undefined;

    const forms = await getForms(projectId);
    return NextResponse.json({ success: true, count: forms.length, data: forms });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Handle Multipart Form Data (XLSX File Upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const projectId = formData.get('project_id') as string | null;
      const customTitle = formData.get('title') as string | null;

      if (!file) {
        return NextResponse.json({ success: false, error: 'No XLSX file provided' }, { status: 400 });
      }

      if (!projectId) {
        return NextResponse.json({ success: false, error: 'Target project_id is required' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Validate & Parse XLSForm structure
      const parsed = parseXlsForm(buffer);
      if (!parsed.success || !parsed.structure) {
        return NextResponse.json(
          {
            success: false,
            error: parsed.error || 'Failed to parse XLSForm structure',
            warnings: parsed.warnings,
          },
          { status: 422 }
        );
      }

      const newForm = await createForm({
        project_id: projectId,
        title: customTitle || parsed.structure.title || file.name.replace(/\.[^/.]+$/, ''),
        form_id: parsed.structure.form_id || `form_${Date.now()}`,
        version: parsed.structure.version || '1.0',
        uploaded_file: file.name,
        form_structure: parsed.structure,
      });

      return NextResponse.json(
        {
          success: true,
          message: 'XLSForm successfully validated, parsed, and converted to digital structure!',
          data: newForm,
          warnings: parsed.warnings,
        },
        { status: 201 }
      );
    }

    // Handle Direct JSON Form Structure
    const body = await req.json();
    const { project_id, title, form_id, version, form_structure, uploaded_file } = body;

    if (!project_id || !title || !form_structure) {
      return NextResponse.json(
        { success: false, error: 'project_id, title, and form_structure are required' },
        { status: 400 }
      );
    }

    const newForm = await createForm({
      project_id,
      title,
      form_id: form_id || `form_${Date.now()}`,
      version: version || '1.0',
      uploaded_file: uploaded_file || 'direct_schema.json',
      form_structure,
    });

    return NextResponse.json({ success: true, data: newForm }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
