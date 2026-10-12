import * as XLSX from 'xlsx';
import { DataSubmission, Project, Supervisor, TeamMember } from './types';

export interface ExportDataPayload {
  submissions: DataSubmission[];
  projects?: Project[];
  supervisors?: Supervisor[];
  teamMembers?: TeamMember[];
  filterSummary?: {
    projectName?: string;
    supervisorName?: string;
    dateRange?: string;
    status?: string;
  };
}

/**
 * Generates a comprehensive multi-sheet Excel file (.xlsx) containing survey submissions and related metadata.
 */
export function generateSubmissionsExcelBuffer(payload: ExportDataPayload): Buffer {
  const workbook = XLSX.utils.book_new();

  // 1. Prepare Submissions Flat Table
  const submissionRows = payload.submissions.map((sub) => {
    const row: Record<string, any> = {
      'Submission ID': sub.id,
      'Project Name': sub.project_name || 'N/A',
      'Form Title': sub.form_title || 'N/A',
      'Team Member': sub.team_member_name || sub.team_member_id,
      'Supervisor': sub.supervisor_name || sub.supervisor_id,
      'Submission Time': new Date(sub.submitted_time).toLocaleString(),
      'Sync Status': sub.sync_status.toUpperCase(),
      'Verification Status': (sub.status || 'verified').toUpperCase(),
      'GPS Latitude': sub.gps_location?.latitude ?? '',
      'GPS Longitude': sub.gps_location?.longitude ?? '',
      'GPS Altitude (m)': sub.gps_location?.altitude ?? '',
      'GPS Accuracy (m)': sub.gps_location?.accuracy ?? '',
      'Location Address': sub.gps_location?.address ?? '',
    };

    // Flatten form data answers
    if (sub.form_data && typeof sub.form_data === 'object') {
      for (const [key, val] of Object.entries(sub.form_data)) {
        if (Array.isArray(val)) {
          row[`Answer: ${key}`] = val.join(', ');
        } else if (typeof val === 'object' && val !== null) {
          row[`Answer: ${key}`] = JSON.stringify(val);
        } else {
          row[`Answer: ${key}`] = val !== undefined && val !== null ? String(val) : '';
        }
      }
    }

    return row;
  });

  const submissionsWs = XLSX.utils.json_to_sheet(
    submissionRows.length > 0 ? submissionRows : [{ Message: 'No submissions matched the selected criteria' }]
  );
  XLSX.utils.book_append_sheet(workbook, submissionsWs, 'Submissions');

  // 2. Supervisors Sheet
  if (payload.supervisors && payload.supervisors.length > 0) {
    const supervisorRows = payload.supervisors.map((s) => ({
      'Supervisor ID': s.id,
      'Name': s.user?.name || 'N/A',
      'Username': s.user?.username || 'N/A',
      'Email': s.user?.email || 'N/A',
      'Phone': s.user?.phone || 'N/A',
      'Assigned Project': s.project?.project_name || s.assigned_project,
      'Status': s.user?.status?.toUpperCase() || 'ACTIVE',
      'Total Team Members': s.team_members_count || 0,
      'Total Submissions': s.submissions_count || 0,
    }));
    const supervisorsWs = XLSX.utils.json_to_sheet(supervisorRows);
    XLSX.utils.book_append_sheet(workbook, supervisorsWs, 'Supervisors');
  }

  // 3. Team Members Sheet
  if (payload.teamMembers && payload.teamMembers.length > 0) {
    const teamMemberRows = payload.teamMembers.map((tm) => ({
      'Team Member ID': tm.id,
      'Name': tm.user?.name || 'N/A',
      'Username': tm.user?.username || 'N/A',
      'Phone': tm.user?.phone || 'N/A',
      'Supervisor': tm.supervisor?.user?.name || tm.supervisor_id,
      'Project': tm.project?.project_name || 'N/A',
      'Status': tm.user?.status?.toUpperCase() || 'ACTIVE',
      'Submissions': tm.submissions_count || 0,
    }));
    const teamMembersWs = XLSX.utils.json_to_sheet(teamMemberRows);
    XLSX.utils.book_append_sheet(workbook, teamMembersWs, 'Field Team');
  }

  // 4. Projects Sheet
  if (payload.projects && payload.projects.length > 0) {
    const projectRows = payload.projects.map((p) => ({
      'Project ID': p.id,
      'Project Name': p.project_name,
      'Description': p.description,
      'Status': p.status.toUpperCase(),
      'Start Date': p.start_date,
      'End Date': p.end_date,
      'Total Submissions': p.submissions_count || 0,
      'Total Supervisors': p.supervisors_count || 0,
    }));
    const projectsWs = XLSX.utils.json_to_sheet(projectRows);
    XLSX.utils.book_append_sheet(workbook, projectsWs, 'Projects');
  }

  // 5. System Export Metadata
  const metadataRows = [
    { Property: 'Platform Name', Value: 'Innovative Data Platform' },
    { Property: 'Project Creator', Value: 'Saif' },
    { Property: 'Export Generated At', Value: new Date().toISOString() },
    { Property: 'Total Records Exported', Value: String(payload.submissions.length) },
    { Property: 'Project Filter', Value: payload.filterSummary?.projectName || 'All Projects' },
    { Property: 'Supervisor Filter', Value: payload.filterSummary?.supervisorName || 'All Supervisors' },
    { Property: 'Date Range Filter', Value: payload.filterSummary?.dateRange || 'All Time' },
    { Property: 'Status Filter', Value: payload.filterSummary?.status || 'All Statuses' },
  ];
  const metaWs = XLSX.utils.json_to_sheet(metadataRows);
  XLSX.utils.book_append_sheet(workbook, metaWs, 'Export Info');

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
}
