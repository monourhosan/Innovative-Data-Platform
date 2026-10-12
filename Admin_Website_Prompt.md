# Admin_Website_Prompt.md

# Google Antigravity IDE Development Prompt

# Model: Gemini 3.8 Flash

# Project Name

Innovative Data Platform

# Project Creator

Saif

# Development Module

Admin Website Platform

------------------------------------------------------------------------

# ROLE AND RESPONSIBILITY

You are an expert full-stack software architect, UI/UX designer,
database engineer, security engineer, and DevOps developer.

Your task is to design and build the complete Admin Website module of
the Innovative Data Platform.

Do not only create a prototype.

Create a production-ready system architecture that can be deployed and
connected with two separate Android applications:

1.  Supervisor Android Application
2.  Team Member Android Application

This Admin Website must work as the central management system similar in
workflow to KoboToolbox.

The final product must be simple enough that a non-technical
administrator can operate it without training.

------------------------------------------------------------------------

# PRODUCT VISION

Innovative Data Platform is a digital field data collection ecosystem.

The Admin Website is the control center.

The Admin controls:

-   Projects
-   Survey forms
-   Supervisors
-   Field teams
-   Data collection monitoring
-   Data export
-   System settings

The workflow:

Admin creates project ↓ Admin uploads XLSX survey form ↓ System
generates digital forms ↓ Admin creates supervisors ↓ Supervisor
receives login credentials ↓ Supervisor creates team members ↓ Team
members collect field data ↓ Data synchronizes back to server ↓ Admin
monitors and exports data

------------------------------------------------------------------------

# REQUIRED TECHNOLOGY STACK

Build this application using modern scalable technologies.

Preferred stack:

Frontend: - Next.js latest version - React - TypeScript - Tailwind CSS -
Responsive design - Component based architecture

Backend: - Next.js API routes or separate backend API - REST API
architecture

Database: Preferred: - PostgreSQL - Supabase compatible architecture

Authentication: - Secure JWT/session authentication - Role based
authorization

Hosting: - Must be deployable on Vercel

Storage: - Cloud storage compatible for uploaded XLSX files and media
files

------------------------------------------------------------------------

# DEVELOPMENT RULES

Important:

1.  Write clean professional code.
2.  Separate frontend, backend, database, and API logic.
3.  Add comments explaining complex functions.
4.  Create reusable components.
5.  Do not hardcode values.
6.  Prepare the project for future expansion.
7.  Follow security best practices.
8.  Create documentation.

------------------------------------------------------------------------

# USER ROLES

The system has three roles.

## 1. Admin

Full access.

Can:

-   Create projects
-   Upload forms
-   Manage supervisors
-   View all collected data
-   Export reports
-   Manage settings

## 2. Supervisor

Limited access.

Can:

-   Login from Supervisor App
-   Manage own team members
-   View own team's data

## 3. Team Member

Limited access.

Can:

-   Login from Field Collector App
-   Collect data
-   Submit assigned forms

------------------------------------------------------------------------

# DATABASE DESIGN

Create database structure for:

## Users Table

Fields:

-   id
-   name
-   email
-   phone
-   username
-   password_hash
-   role
-   status
-   created_at
-   updated_at

## Projects Table

Fields:

-   id
-   project_name
-   description
-   created_by
-   status
-   created_at

## Survey Forms Table

Fields:

-   id
-   project_id
-   uploaded_file
-   form_structure
-   version
-   created_at

## Supervisors Table

Fields:

-   id
-   user_id
-   assigned_project
-   created_by

## Team Members Table

Fields:

-   id
-   supervisor_id
-   user_id

## Data Submission Table

Fields:

-   id
-   project_id
-   supervisor_id
-   team_member_id
-   form_data
-   gps_location
-   submitted_time
-   sync_status

------------------------------------------------------------------------

# AUTHENTICATION SYSTEM

Create:

Admin login page.

Requirements:

-   Secure login
-   Password hashing
-   Session management
-   Logout
-   Password reset
-   Permission checking

Protect every private page.

------------------------------------------------------------------------

# ADMIN DASHBOARD

Create a professional dashboard.

Display:

## Statistics Cards

-   Total Projects
-   Total Supervisors
-   Total Team Members
-   Total Data Records
-   Active Users

## Charts

Create:

-   Data submission chart
-   User activity chart
-   Project progress chart

## Recent Activity

Show:

-   New supervisor created
-   New submission received
-   New project created

------------------------------------------------------------------------

# PROJECT MANAGEMENT SYSTEM

Admin can:

Create project.

Project fields:

-   Project name
-   Description
-   Start date
-   End date
-   Status

Actions:

-   Edit project
-   Delete project
-   Activate/deactivate project
-   View project statistics

------------------------------------------------------------------------

# XLSX FORM IMPORT SYSTEM

This is a critical feature.

The admin uploads XLSX files similar to KoboToolbox XLSForm.

The system must:

1.  Accept XLSX upload.
2.  Validate XLSX structure.
3.  Read survey sheet.
4.  Read choices sheet.
5.  Read settings sheet.
6.  Convert XLSX into JSON form structure.
7.  Store form configuration.
8.  Make forms available to Android apps.

Support:

-   Text questions
-   Number questions
-   Date questions
-   Time questions
-   Select one
-   Select multiple
-   Required questions
-   Validation rules
-   Question groups

------------------------------------------------------------------------

# SUPERVISOR MANAGEMENT

Admin interface:

Create supervisor.

Required fields:

-   Full name
-   Phone
-   Email
-   Username
-   Password
-   Assigned project

Features:

-   Generate credentials
-   Edit supervisor
-   Disable account
-   Reset password
-   View activity

------------------------------------------------------------------------

# LIVE MONITORING DASHBOARD

Create real-time monitoring.

Admin can see:

-   Current active supervisors
-   Active team members
-   Latest submissions
-   Submission locations
-   Upload status

Include:

-   Search
-   Filters
-   Sorting
-   Pagination

------------------------------------------------------------------------

# DATA MANAGEMENT

Create data viewer.

Admin can:

-   View all records
-   Filter by project
-   Filter by supervisor
-   Filter by team member
-   Search answers
-   Open individual submission

------------------------------------------------------------------------

# XLSX EXPORT SYSTEM

Create export feature.

Admin can download:

-   All project data
-   Supervisor data
-   Team member data
-   Date filtered data

Export format:

.xlsx

Include:

-   Survey answers
-   User information
-   Submission time
-   GPS information

------------------------------------------------------------------------

# API DEVELOPMENT

Create APIs for Android applications.

Required endpoints:

Authentication:

POST /login

Projects:

GET /projects

Forms:

GET /forms

Data:

POST /submissions

Dashboard:

GET /statistics

Users:

POST /users

Export:

GET /export

Document all APIs.

------------------------------------------------------------------------

# USER INTERFACE DESIGN

The UI must be extremely easy.

Design rules:

-   Clean white interface
-   Large readable text
-   Clear icons
-   Simple navigation
-   Mobile responsive

Sidebar:

Dashboard

Projects

Supervisors

Data Records

Reports

Export

Settings

------------------------------------------------------------------------

# SECURITY REQUIREMENTS

Implement:

-   Password encryption
-   Input validation
-   API protection
-   Role permissions
-   Secure file upload
-   Database protection

------------------------------------------------------------------------

# DEPLOYMENT REQUIREMENTS

Prepare deployment for:

Vercel hosting.

Include:

-   Environment variables
-   Production configuration
-   Database connection setup
-   Deployment instructions

------------------------------------------------------------------------

# FUTURE READY FEATURES

Prepare architecture for:

-   Offline synchronization
-   GIS maps
-   AI data validation
-   Multiple organizations
-   Multiple languages
-   Advanced analytics

------------------------------------------------------------------------

# FINAL INSTRUCTION TO GEMINI

Build only the Admin Website module.

Do not create Android applications inside this project.

Keep this project independent.

The final system name:

Innovative Data Platform

Created by:

Saif
