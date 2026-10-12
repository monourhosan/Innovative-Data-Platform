export type UserRole = 'admin' | 'supervisor' | 'team_member';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type ProjectStatus = 'active' | 'planning' | 'completed' | 'archived';
export type SyncStatus = 'synced' | 'pending' | 'failed';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  password_hash?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  project_name: string;
  description: string;
  created_by: string;
  status: ProjectStatus;
  start_date: string;
  end_date: string;
  created_at: string;
  supervisors_count?: number;
  team_members_count?: number;
  submissions_count?: number;
  forms_count?: number;
}

export interface SurveyChoice {
  list_name: string;
  name: string;
  label: string;
}

export interface SurveyQuestion {
  type: string; // text, integer, decimal, date, time, select_one, select_multiple, note, calculate
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  constraint?: string;
  constraint_message?: string;
  relevant?: string;
  appearance?: string;
  choices?: { name: string; label: string }[];
  group?: string;
}

export interface SurveyFormStructure {
  form_id: string;
  title: string;
  version: string;
  default_language?: string;
  questions: SurveyQuestion[];
  choices: Record<string, { name: string; label: string }[]>;
  settings?: Record<string, string>;
}

export interface SurveyForm {
  id: string;
  project_id: string;
  project_name?: string;
  title: string;
  form_id: string;
  version: string;
  uploaded_file: string;
  form_structure: SurveyFormStructure;
  created_at: string;
  submissions_count?: number;
}

export interface Supervisor {
  id: string;
  user_id: string;
  assigned_project: string; // Project ID
  created_by: string; // Admin User ID
  user?: User;
  project?: Project;
  team_members_count?: number;
  submissions_count?: number;
}

export interface TeamMember {
  id: string;
  supervisor_id: string;
  user_id: string;
  user?: User;
  supervisor?: Supervisor;
  project_id?: string;
  project?: Project;
  submissions_count?: number;
}

export interface GpsLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  address?: string;
}

export interface DataSubmission {
  id: string;
  project_id: string;
  project_name?: string;
  form_id: string;
  form_title?: string;
  supervisor_id: string;
  supervisor_name?: string;
  team_member_id: string;
  team_member_name?: string;
  form_data: Record<string, any>;
  gps_location: GpsLocation;
  submitted_time: string;
  sync_status: SyncStatus;
  status?: 'verified' | 'pending' | 'flagged' | 'rejected';
}

export interface SystemActivity {
  id: string;
  type: 'supervisor_created' | 'submission_received' | 'project_created' | 'form_uploaded' | 'export_generated';
  title: string;
  description: string;
  timestamp: string;
  actor_name: string;
  metadata?: Record<string, any>;
}

export interface SystemStatistics {
  total_projects: number;
  total_supervisors: number;
  total_team_members: number;
  total_submissions: number;
  active_users: number;
  submissions_today: number;
  sync_rate: number;
  chart_data: {
    dates: string[];
    submissions: number[];
  };
  project_progress: {
    name: string;
    target: number;
    completed: number;
    percentage: number;
  }[];
  recent_activities: SystemActivity[];
}
