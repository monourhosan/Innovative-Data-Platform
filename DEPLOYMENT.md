# Innovative Data Platform — Admin Website Platform

**System Architect & Creator**: Saif  
**Role**: Central Field Survey Management System & Control Center  
**Compatibility**: KoboToolbox / ODK XLSForm Standard  
**Deployment Target**: Vercel & Supabase / PostgreSQL  

---

## 1. System Overview

The **Admin Website Platform** serves as the central brain of the **Innovative Data Platform** ecosystem. It coordinates:

1. **Campaign & Project Lifecycle**: Create, schedule, activate, and evaluate field projects.
2. **KoboToolbox-Compliant XLSForm Import**: Upload, validate, convert, and preview digital survey forms from `.xlsx` workbooks (`survey`, `choices`, and `settings` sheets).
3. **Personnel Hierarchy**:
   - **Administrators**: Full system authority, form uploads, and export capabilities.
   - **Supervisors**: Assigned to specific projects, oversee field enumerators.
   - **Team Members**: Mobile field data collectors.
4. **Live Telemetry & GIS Monitoring**: Real-time geolocation tracking of Android submissions on interactive maps.
5. **Data Records Inspection**: Full-text search and verification audits across all submitted field questionnaires.
6. **Multi-Sheet XLSX Export Engine**: Generate formatted Microsoft Excel workbooks (.xlsx) with answers, timestamps, and GPS coordinates.
7. **Production REST API**: Native endpoints for the **Supervisor Android App** and **Team Member Android App**.

---

## 2. Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Icons & Motion**: Lucide React
- **Mapping & GIS**: Leaflet & OpenStreetMap
- **XLSForm Engine**: SheetJS (`xlsx`) with custom XLSForm parser and validator
- **Authentication**: JWT (`jsonwebtoken`) & Bcrypt password hashing (`bcryptjs`)
- **Database Architecture**: PostgreSQL / Supabase with Prisma Schema (`prisma/schema.prisma`) & resilient unified data access layer (`src/lib/db.ts`)
- **Hosting**: Vercel Serverless

---

## 3. Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open browser
http://localhost:3000
```

### Pre-Configured Test Credentials:
- **Lead Administrator**:
  - Username: `admin`
  - Password: `AdminPassword123!`
- **Supervisor**:
  - Username: `tariq_sup`
  - Password: `Supervisor123!`
- **Team Member**:
  - Username: `amina_field`
  - Password: `FieldTeam123!`

---

## 4. Deploying to Vercel

1. Push your repository to GitHub or GitLab.
2. Go to [Vercel Dashboard](https://vercel.com/new) and select your repository.
3. Add Environment Variables:
   - `DATABASE_URL`: Your Supabase or PostgreSQL connection string (optional; automatic fallback storage provided).
   - `JWT_SECRET`: A secure random secret string.
4. Click **Deploy**. Vercel will automatically build the Next.js application.

---

## 5. Connecting Android Applications

The Admin Website exposes REST APIs tailored for the mobile applications:

| Endpoint | Method | Purpose | Consumer |
|---|---|---|---|
| `/api/login` | POST | Authenticate & retrieve JWT bearer token | Both Apps |
| `/api/projects` | GET | List assigned survey projects | Both Apps |
| `/api/forms` | GET | Retrieve digital form schemas for offline survey caching | Both Apps |
| `/api/forms/[id]` | GET | Download specific questionnaire definition | Both Apps |
| `/api/submissions` | POST | Synchronize field collected survey responses + GPS | Team Member App |
| `/api/statistics` | GET | Retrieve live progress & telemetry metrics | Both Apps |
| `/api/export` | GET | Download multi-sheet `.xlsx` report | Admin / Supervisor |

### Authorization Header
All requests after login should include:
```http
Authorization: Bearer <your_jwt_token>
```
