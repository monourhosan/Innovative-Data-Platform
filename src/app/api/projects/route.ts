import { createProject, getProjects } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const projects = await getProjects();
    return NextResponse.json({ success: true, count: projects.length, data: projects });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { project_name, description, start_date, end_date, status, created_by } = body;

    if (!project_name || !description) {
      return NextResponse.json(
        { success: false, error: 'Project name and description are required.' },
        { status: 400 }
      );
    }

    const newProject = await createProject({
      project_name,
      description,
      status: status || 'active',
      start_date: start_date || new Date().toISOString().split('T')[0],
      end_date: end_date || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      created_by: created_by || 'admin',
    });

    return NextResponse.json({ success: true, data: newProject }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
