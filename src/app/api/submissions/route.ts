import { createSubmission, getSubmissions } from '@/lib/db';
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
    const search = searchParams.get('search') || undefined;

    const submissions = await getSubmissions({
      projectId,
      supervisorId,
      teamMemberId,
      status,
      startDate,
      endDate,
      search,
    });

    return NextResponse.json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      project_id,
      form_id,
      supervisor_id,
      team_member_id,
      form_data,
      gps_location,
      sync_status,
    } = body;

    // Validation
    if (!project_id || !form_id || !team_member_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Required fields missing: project_id, form_id, and team_member_id are mandatory.',
        },
        { status: 400 }
      );
    }

    if (!form_data || typeof form_data !== 'object') {
      return NextResponse.json(
        { success: false, error: 'form_data must be a valid JSON object containing answers.' },
        { status: 400 }
      );
    }

    const defaultGps = {
      latitude: gps_location?.latitude ?? 23.8103,
      longitude: gps_location?.longitude ?? 90.4125,
      altitude: gps_location?.altitude ?? 10.0,
      accuracy: gps_location?.accuracy ?? 3.5,
      address: gps_location?.address ?? 'Field Location',
    };

    const newSubmission = await createSubmission({
      project_id,
      form_id,
      supervisor_id: supervisor_id || 'sup-1',
      team_member_id,
      form_data,
      gps_location: defaultGps,
      sync_status: sync_status || 'synced',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Field data submission successfully recorded and synchronized.',
        submission_id: newSubmission.id,
        submitted_time: newSubmission.submitted_time,
        data: newSubmission,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
