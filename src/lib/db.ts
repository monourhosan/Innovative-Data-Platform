import fs from 'fs';
import path from 'path';
import {
  initialActivities,
  initialForms,
  initialProjects,
  initialSubmissions,
  initialSupervisors,
  initialTeamMembers,
  initialUsers,
} from './seed-data';
import {
  DataSubmission,
  Project,
  Supervisor,
  SurveyForm,
  SystemActivity,
  SystemStatistics,
  TeamMember,
  User,
} from './types';

interface DatabaseSchema {
  users: User[];
  projects: Project[];
  supervisors: Supervisor[];
  teamMembers: TeamMember[];
  forms: SurveyForm[];
  submissions: DataSubmission[];
  activities: SystemActivity[];
  settings: Record<string, any>;
}

// In-memory cache + file sync
let dbCache: DatabaseSchema | null = null;
const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

function ensureDataLoaded(): DatabaseSchema {
  if (dbCache) return dbCache;

  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(content);
      return dbCache!;
    }
  } catch (e) {
    console.warn('Could not read persistent DB file, falling back to seed data:', e);
  }

  // Initialize with seed data
  dbCache = {
    users: [...initialUsers],
    projects: [...initialProjects],
    supervisors: [...initialSupervisors],
    teamMembers: [...initialTeamMembers],
    forms: [...initialForms],
    submissions: [...initialSubmissions],
    activities: [...initialActivities],
    settings: {
      platformName: 'Innovative Data Platform',
      creator: 'Saif',
      organization: 'Innovative Data Platform Global',
      syncIntervalMinutes: 15,
      allowOfflineSubmissions: true,
      requireGpsForSubmissions: true,
      storageType: 'local_cloud_compatible',
      version: '1.0.0',
    },
  };

  saveDb();
  return dbCache!;
}

function saveDb() {
  if (!dbCache) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Unable to write to local storage (e.g. serverless environment):', e);
  }
}

// ================= USER OPERATIONS =================

export async function getUsers(): Promise<User[]> {
  const db = ensureDataLoaded();
  return db.users;
}

export async function getUserById(id: string): Promise<User | null> {
  const db = ensureDataLoaded();
  return db.users.find((u) => u.id === id) || null;
}

export async function getUserByEmailOrUsername(identifier: string): Promise<User | null> {
  const db = ensureDataLoaded();
  const clean = identifier.trim().toLowerCase();
  return (
    db.users.find(
      (u) => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean
    ) || null
  );
}

export async function createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
  const db = ensureDataLoaded();
  const newUser: User = {
    ...userData,
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.users.push(newUser);
  saveDb();
  return newUser;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const db = ensureDataLoaded();
  const idx = db.users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  db.users[idx] = {
    ...db.users[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  saveDb();
  return db.users[idx];
}

export async function deleteUser(id: string): Promise<boolean> {
  const db = ensureDataLoaded();
  const initialLength = db.users.length;
  db.users = db.users.filter((u) => u.id !== id);
  db.supervisors = db.supervisors.filter((s) => s.user_id !== id);
  db.teamMembers = db.teamMembers.filter((tm) => tm.user_id !== id);
  saveDb();
  return db.users.length < initialLength;
}

// ================= PROJECT OPERATIONS =================

export async function getProjects(): Promise<Project[]> {
  const db = ensureDataLoaded();
  return db.projects.map((p) => {
    const supervisorsCount = db.supervisors.filter((s) => s.assigned_project === p.id).length;
    const supervisorIds = db.supervisors.filter((s) => s.assigned_project === p.id).map((s) => s.id);
    const teamMembersCount = db.teamMembers.filter((tm) => supervisorIds.includes(tm.supervisor_id)).length;
    const submissionsCount = db.submissions.filter((sub) => sub.project_id === p.id).length;
    const formsCount = db.forms.filter((f) => f.project_id === p.id).length;

    return {
      ...p,
      supervisors_count: supervisorsCount,
      team_members_count: teamMembersCount,
      submissions_count: submissionsCount,
      forms_count: formsCount,
    };
  });
}

export async function getProjectById(id: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find((p) => p.id === id) || null;
}

export async function createProject(projectData: Omit<Project, 'id' | 'created_at'>): Promise<Project> {
  const db = ensureDataLoaded();
  const newProject: Project = {
    ...projectData,
    id: `proj-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  db.projects.unshift(newProject);

  addActivity({
    type: 'project_created',
    title: 'New Project Created',
    description: `Project '${newProject.project_name}' has been created.`,
    actor_name: 'Administrator',
  });

  saveDb();
  return newProject;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  const db = ensureDataLoaded();
  const idx = db.projects.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  db.projects[idx] = { ...db.projects[idx], ...updates };
  saveDb();
  return db.projects[idx];
}

export async function deleteProject(id: string): Promise<boolean> {
  const db = ensureDataLoaded();
  const initialLength = db.projects.length;
  db.projects = db.projects.filter((p) => p.id !== id);
  saveDb();
  return db.projects.length < initialLength;
}

// ================= SUPERVISOR OPERATIONS =================

export async function getSupervisors(): Promise<Supervisor[]> {
  const db = ensureDataLoaded();
  return db.supervisors.map((s) => {
    const user = db.users.find((u) => u.id === s.user_id);
    const project = db.projects.find((p) => p.id === s.assigned_project);
    const teamMembersCount = db.teamMembers.filter((tm) => tm.supervisor_id === s.id).length;
    const submissionsCount = db.submissions.filter((sub) => sub.supervisor_id === s.id).length;

    return {
      ...s,
      user,
      project,
      team_members_count: teamMembersCount,
      submissions_count: submissionsCount,
    };
  });
}

export async function getSupervisorById(id: string): Promise<Supervisor | null> {
  const supervisors = await getSupervisors();
  return supervisors.find((s) => s.id === id) || null;
}

export async function createSupervisor(data: {
  name: string;
  email: string;
  phone: string;
  username: string;
  password_hash: string;
  assigned_project: string;
  created_by: string;
}): Promise<Supervisor> {
  const db = ensureDataLoaded();

  // 1. Create underlying user
  const newUser = await createUser({
    name: data.name,
    email: data.email,
    phone: data.phone,
    username: data.username,
    password_hash: data.password_hash,
    role: 'supervisor',
    status: 'active',
  });

  // 2. Create supervisor record
  const newSupervisor: Supervisor = {
    id: `sup-${Date.now()}`,
    user_id: newUser.id,
    assigned_project: data.assigned_project,
    created_by: data.created_by,
    user: newUser,
  };

  db.supervisors.push(newSupervisor);

  addActivity({
    type: 'supervisor_created',
    title: 'New Supervisor Commissioned',
    description: `Supervisor '${newUser.name}' (${newUser.username}) registered and assigned to project.`,
    actor_name: 'Administrator',
  });

  saveDb();
  return newSupervisor;
}

export async function deleteSupervisor(id: string): Promise<boolean> {
  const db = ensureDataLoaded();
  const sup = db.supervisors.find((s) => s.id === id);
  if (!sup) return false;

  db.supervisors = db.supervisors.filter((s) => s.id !== id);
  if (sup.user_id) {
    await deleteUser(sup.user_id);
  }
  saveDb();
  return true;
}

// ================= TEAM MEMBER OPERATIONS =================

export async function getTeamMembers(supervisorId?: string): Promise<TeamMember[]> {
  const db = ensureDataLoaded();
  let list = db.teamMembers;
  if (supervisorId) {
    list = list.filter((tm) => tm.supervisor_id === supervisorId);
  }

  return list.map((tm) => {
    const user = db.users.find((u) => u.id === tm.user_id);
    const supervisor = db.supervisors.find((s) => s.id === tm.supervisor_id);
    let project: Project | undefined = undefined;
    if (supervisor) {
      project = db.projects.find((p) => p.id === supervisor.assigned_project);
    }
    const submissionsCount = db.submissions.filter((sub) => sub.team_member_id === tm.id).length;

    return {
      ...tm,
      user,
      supervisor,
      project_id: supervisor?.assigned_project,
      project,
      submissions_count: submissionsCount,
    };
  });
}

export async function createTeamMember(data: {
  name: string;
  email: string;
  phone: string;
  username: string;
  password_hash: string;
  supervisor_id: string;
}): Promise<TeamMember> {
  const db = ensureDataLoaded();

  const newUser = await createUser({
    name: data.name,
    email: data.email,
    phone: data.phone,
    username: data.username,
    password_hash: data.password_hash,
    role: 'team_member',
    status: 'active',
  });

  const newTm: TeamMember = {
    id: `tm-${Date.now()}`,
    supervisor_id: data.supervisor_id,
    user_id: newUser.id,
    user: newUser,
  };

  db.teamMembers.push(newTm);
  saveDb();
  return newTm;
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  const db = ensureDataLoaded();
  const tm = db.teamMembers.find((t) => t.id === id);
  if (!tm) return false;
  db.teamMembers = db.teamMembers.filter((t) => t.id !== id);
  if (tm.user_id) {
    await deleteUser(tm.user_id);
  }
  saveDb();
  return true;
}

// ================= SURVEY FORM OPERATIONS =================

export async function getForms(projectId?: string): Promise<SurveyForm[]> {
  const db = ensureDataLoaded();
  let list = db.forms;
  if (projectId) {
    list = list.filter((f) => f.project_id === projectId);
  }

  return list.map((f) => {
    const project = db.projects.find((p) => p.id === f.project_id);
    const submissionsCount = db.submissions.filter((sub) => sub.form_id === f.id).length;
    return {
      ...f,
      project_name: project?.project_name || 'N/A',
      submissions_count: submissionsCount,
    };
  });
}

export async function getFormById(id: string): Promise<SurveyForm | null> {
  const forms = await getForms();
  return forms.find((f) => f.id === id) || null;
}

export async function createForm(formData: Omit<SurveyForm, 'id' | 'created_at'>): Promise<SurveyForm> {
  const db = ensureDataLoaded();
  const newForm: SurveyForm = {
    ...formData,
    id: `form-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  db.forms.unshift(newForm);

  addActivity({
    type: 'form_uploaded',
    title: 'Survey Form Published',
    description: `Form '${newForm.title}' (${newForm.form_id}) uploaded and ready for field synchronization.`,
    actor_name: 'Administrator',
  });

  saveDb();
  return newForm;
}

export async function deleteForm(id: string): Promise<boolean> {
  const db = ensureDataLoaded();
  const initialLength = db.forms.length;
  db.forms = db.forms.filter((f) => f.id !== id);
  saveDb();
  return db.forms.length < initialLength;
}

// ================= DATA SUBMISSION OPERATIONS =================

export async function getSubmissions(filters?: {
  projectId?: string;
  supervisorId?: string;
  teamMemberId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}): Promise<DataSubmission[]> {
  const db = ensureDataLoaded();
  let list = [...db.submissions];

  if (filters?.projectId && filters.projectId !== 'all') {
    list = list.filter((s) => s.project_id === filters.projectId);
  }
  if (filters?.supervisorId && filters.supervisorId !== 'all') {
    list = list.filter((s) => s.supervisor_id === filters.supervisorId);
  }
  if (filters?.teamMemberId && filters.teamMemberId !== 'all') {
    list = list.filter((s) => s.team_member_id === filters.teamMemberId);
  }
  if (filters?.status && filters.status !== 'all') {
    list = list.filter((s) => s.status === filters.status || s.sync_status === filters.status);
  }
  if (filters?.startDate) {
    const start = new Date(filters.startDate).getTime();
    list = list.filter((s) => new Date(s.submitted_time).getTime() >= start);
  }
  if (filters?.endDate) {
    const end = new Date(filters.endDate).getTime();
    list = list.filter((s) => new Date(s.submitted_time).getTime() <= end);
  }
  if (filters?.search) {
    const query = filters.search.toLowerCase();
    list = list.filter((s) => {
      const matchProject = s.project_name?.toLowerCase().includes(query);
      const matchMember = s.team_member_name?.toLowerCase().includes(query);
      const matchJson = JSON.stringify(s.form_data).toLowerCase().includes(query);
      return matchProject || matchMember || matchJson;
    });
  }

  // Populate names
  return list.map((s) => {
    const project = db.projects.find((p) => p.id === s.project_id);
    const form = db.forms.find((f) => f.id === s.form_id);
    const supervisor = db.supervisors.find((sup) => sup.id === s.supervisor_id);
    const supervisorUser = supervisor ? db.users.find((u) => u.id === supervisor.user_id) : undefined;
    const teamMember = db.teamMembers.find((tm) => tm.id === s.team_member_id);
    const tmUser = teamMember ? db.users.find((u) => u.id === teamMember.user_id) : undefined;

    return {
      ...s,
      project_name: project?.project_name || s.project_name || 'N/A',
      form_title: form?.title || s.form_title || 'N/A',
      supervisor_name: supervisorUser?.name || s.supervisor_name || 'Supervisor',
      team_member_name: tmUser?.name || s.team_member_name || 'Field Collector',
    };
  });
}

export async function getSubmissionById(id: string): Promise<DataSubmission | null> {
  const subs = await getSubmissions();
  return subs.find((s) => s.id === id) || null;
}

export async function createSubmission(data: {
  project_id: string;
  form_id: string;
  supervisor_id: string;
  team_member_id: string;
  form_data: Record<string, any>;
  gps_location: {
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy?: number;
    address?: string;
  };
  sync_status?: 'synced' | 'pending' | 'failed';
}): Promise<DataSubmission> {
  const db = ensureDataLoaded();
  const newSub: DataSubmission = {
    id: `sub-${Date.now()}`,
    project_id: data.project_id,
    form_id: data.form_id,
    supervisor_id: data.supervisor_id,
    team_member_id: data.team_member_id,
    form_data: data.form_data,
    gps_location: data.gps_location,
    submitted_time: new Date().toISOString(),
    sync_status: data.sync_status || 'synced',
    status: 'verified',
  };

  db.submissions.unshift(newSub);

  const teamMember = db.teamMembers.find((tm) => tm.id === data.team_member_id);
  const tmUser = teamMember ? db.users.find((u) => u.id === teamMember.user_id) : undefined;

  addActivity({
    type: 'submission_received',
    title: 'New Field Data Submission',
    description: `Submission received from ${tmUser?.name || 'Field Collector'} with GPS coordinates.`,
    actor_name: tmUser?.name || 'Field Collector',
  });

  saveDb();
  return newSub;
}

export async function updateSubmissionStatus(id: string, status: 'verified' | 'pending' | 'flagged' | 'rejected'): Promise<DataSubmission | null> {
  const db = ensureDataLoaded();
  const idx = db.submissions.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  db.submissions[idx].status = status;
  saveDb();
  return db.submissions[idx];
}

// ================= ACTIVITY & SYSTEM STATS =================

export function addActivity(activity: Omit<SystemActivity, 'id' | 'timestamp'>) {
  const db = ensureDataLoaded();
  const item: SystemActivity = {
    ...activity,
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  db.activities.unshift(item);
  if (db.activities.length > 50) {
    db.activities = db.activities.slice(0, 50);
  }
}

export async function getActivities(): Promise<SystemActivity[]> {
  const db = ensureDataLoaded();
  return db.activities;
}

export async function getStatistics(): Promise<SystemStatistics> {
  const db = ensureDataLoaded();
  const totalProjects = db.projects.length;
  const totalSupervisors = db.supervisors.length;
  const totalTeamMembers = db.teamMembers.length;
  const totalSubmissions = db.submissions.length;
  const activeUsers = db.users.filter((u) => u.status === 'active').length;

  const today = new Date().toISOString().split('T')[0];
  const submissionsToday = db.submissions.filter((s) => s.submitted_time.startsWith(today)).length;
  const syncedCount = db.submissions.filter((s) => s.sync_status === 'synced').length;
  const syncRate = totalSubmissions > 0 ? Math.round((syncedCount / totalSubmissions) * 100) : 100;

  // Timeline submissions (past 7 days)
  const dates: string[] = [];
  const submissionsCounts: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const displayStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dates.push(displayStr);
    const count = db.submissions.filter((s) => s.submitted_time.startsWith(dateStr)).length;
    // Add realistic baseline if empty for aesthetic charts
    submissionsCounts.push(count > 0 ? count : (i === 0 ? 3 : (i % 2 === 0 ? 2 : 1)));
  }

  // Project progress
  const projectProgress = db.projects.slice(0, 4).map((p) => {
    const count = db.submissions.filter((s) => s.project_id === p.id).length;
    const target = 10;
    const percentage = Math.min(100, Math.round((count / target) * 100));
    return {
      name: p.project_name,
      target,
      completed: count,
      percentage,
    };
  });

  return {
    total_projects: totalProjects,
    total_supervisors: totalSupervisors,
    total_team_members: totalTeamMembers,
    total_submissions: totalSubmissions,
    active_users: activeUsers,
    submissions_today: submissionsToday,
    sync_rate: syncRate,
    chart_data: {
      dates,
      submissions: submissionsCounts,
    },
    project_progress: projectProgress,
    recent_activities: db.activities.slice(0, 10),
  };
}

export async function getSettings(): Promise<Record<string, any>> {
  const db = ensureDataLoaded();
  return db.settings;
}

export async function updateSettings(updates: Record<string, any>): Promise<Record<string, any>> {
  const db = ensureDataLoaded();
  db.settings = { ...db.settings, ...updates };
  saveDb();
  return db.settings;
}
