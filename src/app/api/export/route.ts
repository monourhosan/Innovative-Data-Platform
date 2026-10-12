import { getProjects, getSubmissions, getSupervisors, getTeamMembers } from '@/lib/db';
import { generateSubmissionsExcelBuffer } from '@/lib/xlsx-exporter';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId') || undefined;
    const supervisorId = searchParams.get('supervisorId') || undefined;
    const teamMemberId = searchParams.get('teamMemberId') || undefined;
    const status = searchParams.get('status') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const [submissions, projects, supervisors, teamMembers] = await Promise.all([
      getSubmissions({ projectId, supervisorId, teamMemberId, status, startDate, endDate }),
      getProjects(),
      getSupervisors(),
      getTeamMembers(),
    ]);

    const targetProject = projectId ? projects.find((p) => p.id === projectId) : undefined;
    const targetSupervisor = supervisorId ? supervisors.find((s) => s.id === supervisorId) : undefined;

    const excelBuffer = generateSubmissionsExcelBuffer({
      submissions,
      projects,
      supervisors,
      teamMembers,
      filterSummary: {
        projectName: targetProject?.project_name,
        supervisorName: targetSupervisor?.user?.name,
        dateRange: startDate && endDate ? `${startDate} to ${endDate}` : undefined,
        status,
      },
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `IDP_Field_Data_Export_${timestamp}.xlsx`;

    return new Response(new Uint8Array(excelBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
