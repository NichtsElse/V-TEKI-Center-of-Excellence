<!--
Purpose: Capture the target technical blueprint for aligning the current MVP with the V-TEKI reference requirements.
Who uses it: Product owner, engineers, and future implementation sessions continuing this codebase.
Main dependencies: Current Vite/React codebase and reference file `V-TEKI Academy Platform Prompt VC.docx`.
Public/main sections: Application architecture, ERD explanation, API design summary, folder structure, and development plan.
Important side effects: None.
-->

# V-TEKI Implementation Blueprint

This blueprint translates the reference requirements into a build plan that still respects the current stack and current MVP state.

## 1. Application Architecture

### Current implementation baseline

- Frontend runtime: `Vite + React + React Router`
- UI system: `Tailwind CSS + shadcn/ui + Lucide`
- State/data access: `React Query`
- Current backend mode: local in-browser adapter via `src/api/appClient.js`

### Target phased architecture

The system should be built in three layers so the current MVP can evolve toward `Express.js + Supabase` without a rewrite:

1. **Presentation layer**
   - Routes, dashboards, forms, cards, tables
   - Role-based navigation and page composition
   - Pages should not own critical business rules

2. **Application/domain layer**
   - Auth and role rules
   - Enrollment lifecycle rules
   - Certificate eligibility logic
   - Attendance completion rules
   - Feedback completion rules
   - Shared selectors and status mappers

3. **Data access layer**
   - Current mode: local adapter using `appClient`
   - Future mode: REST API client calling `Express.js`
   - Final persistence: `Supabase PostgreSQL + Auth + Storage`

### Recommended logical modules

- `auth`
  - login, logout, session, role resolution
- `programs`
  - catalog, details, batch discovery
- `enrollments`
  - individual join flow, corporate inquiry flow, admin confirmation
- `payments`
  - invoice/payment verification and tracking
- `assessments`
  - pre/post assessments and results
- `attendance`
  - sessions, records, attendance percentage
- `feedback`
  - participant evaluation records
- `certificates`
  - eligibility, generation, verification

### Authentication

Authentication must remain a first-class module, not a page-only behavior.

#### Current MVP

- Local session-based auth through `appClient.auth`
- Role-aware redirect and sidebar handling

#### Target backend

- `Express.js` middleware validating Supabase JWT/session
- Current user endpoint `/api/auth/me`
- Role-based authorization middleware

### Role model

The target role model should be:

- `super_admin`
- `academy_admin`
- `trainer`
- `participant`
- `corporate_pic`

### Authorization expectations

- `super_admin`
  - full operational and system access
- `academy_admin`
  - operational access across programs, batches, enrollments, payments, assessments, attendance, certificates
- `trainer`
  - access only to assigned batches, participants, assessments, and attendance views
- `participant`
  - access only to own enrollments, assessments, feedback state, and certificates
- `corporate_pic`
  - access only to own organization participants, invoices, and progress summaries

### RLS strategy

Even though the current MVP is local-first, the design must anticipate Supabase Row Level Security.

RLS intent:

- Participants can only read/write their own records where appropriate
- Trainers can only read assigned delivery records
- Corporate PIC can only read records for their organization
- Admin roles can manage operational records
- Service role is only used server-side, never exposed to frontend

### Certificate eligibility logic

Certificate issuance must always come from one shared business rule:

- `payment_status = paid`
- `attendance_percentage >= 80`
- `post_assessment_status = completed`
- `feedback_status = submitted`
- `completion_status = completed`

This logic must live in a reusable domain helper and never be redefined inconsistently inside many pages.

## 2. Database ERD Explanation

### Core identity and organization entities

- **users_profile**
  - one application user profile
  - linked to auth identity
  - carries role and organization relation

- **organizations**
  - corporate customer or partner organization
  - used by `corporate_pic` and corporate participants

- **trainers**
  - trainer profile
  - linked to a user profile

### Learning catalog and delivery entities

- **programs**
  - learning product definition
  - contains pricing, type, duration, description, and delivery mode

- **batches**
  - delivery instance of a program
  - belongs to one `program`
  - assigned to one `trainer`

### Enrollment and payment entities

- **enrollments**
  - participant enrollment into one batch
  - belongs to one participant user profile
  - belongs to one batch
  - holds lifecycle fields:
    - registration type
    - enrollment status
    - payment status
    - attendance percentage
    - assessment state
    - feedback state
    - completion state
    - certificate state

- **invoices**
  - billing record for individual or corporate enrollment
  - may reference one enrollment or one organization billing group

- **payments**
  - payment evidence and verification result
  - belongs to one invoice

### Assessment entities

- **assessments**
  - belongs to one program
  - typed as pre/post assessment

- **assessment_questions**
  - belongs to one assessment

- **assessment_submissions**
  - belongs to one assessment and one enrollment
  - stores answers, score, and submission state

### Attendance entities

- **attendance_sessions**
  - belongs to one batch
  - defines a class session

- **attendance_records**
  - belongs to one attendance session and one enrollment
  - stores check-in/check-out and attendance result

### Feedback and certificate entities

- **feedback**
  - belongs to one enrollment
  - stores trainer/material/program/satisfaction scoring and comments

- **certificates**
  - belongs to one enrollment
  - contains certificate number, verification code, URL, and issuance status

### Notification entity

- **notifications**
  - belongs to one user profile
  - stores outbound message records

### Relationship summary

- `users_profile` -> many `enrollments`
- `organizations` -> many `users_profile`
- `organizations` -> many `invoices`
- `trainers` -> many `batches`
- `programs` -> many `batches`
- `programs` -> many `assessments`
- `batches` -> many `enrollments`
- `batches` -> many `attendance_sessions`
- `enrollments` -> zero/one `invoice` in simple individual flow
- `invoices` -> many `payments`
- `enrollments` -> many `assessment_submissions`
- `attendance_sessions` -> many `attendance_records`
- `enrollments` -> zero/one `feedback`
- `enrollments` -> zero/one `certificate`

## 3. API Design Summary

The API should remain REST-style and grouped by domain. The current frontend adapter should mirror this shape as much as possible.

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Responsibilities:
- session issuance
- current user lookup
- role-aware auth state

### Programs

- `GET /api/programs`
- `GET /api/programs/:id`
- `POST /api/programs`
- `PUT /api/programs/:id`
- `DELETE /api/programs/:id`

### Batches

- `GET /api/batches`
- `GET /api/batches/:id`
- `POST /api/batches`
- `PUT /api/batches/:id`

### Enrollment

- `POST /api/register/individual`
- `POST /api/register/corporate`
- `GET /api/enrollments`
- `GET /api/enrollments/:id`
- `PUT /api/enrollments/:id`

### Payments

- `POST /api/payments/upload-proof`
- `POST /api/payments/verify`
- `GET /api/invoices`
- `GET /api/payments`

### Assessments

- `GET /api/assessments/:programId`
- `POST /api/assessments`
- `POST /api/assessments/:id/submit`
- `GET /api/assessments/result/:enrollmentId`

### Attendance

- `POST /api/attendance/check-in`
- `POST /api/attendance/check-out`
- `POST /api/attendance/manual`
- `GET /api/attendance/:batchId`

### Feedback

- `POST /api/feedback`
- `GET /api/feedback/:enrollmentId`
- `GET /api/feedback`

### Completion and certificates

- `POST /api/completion/validate/:enrollmentId`
- `POST /api/certificates/generate/:enrollmentId`
- `GET /api/certificates/:certificateNumber`
- `GET /api/certificates/verify/:verificationCode`
- `GET /api/certificates/download/:certificateNumber`

### API rules

- all write endpoints validated with schema validation
- all role-sensitive endpoints protected by auth middleware
- all certificate generation endpoints must use shared eligibility logic
- all Supabase service-role operations must remain server-side only

## 4. Folder Structure

### Current practical structure

```text
src/
  api/
  components/
    admin/
    layout/
    participant/
    public/
    shared/
    ui/
  hooks/
  lib/
  pages/
    admin/
    corporate/
    participant/
    public/
    trainer/
  utils/
```

### Recommended phased structure

```text
src/
  api/
    client/
    services/
  components/
    layout/
    shared/
    ui/
    public/
    admin/
    participant/
    trainer/
    corporate/
  domain/
    auth/
    roles/
    enrollments/
    payments/
    assessments/
    attendance/
    feedback/
    certificates/
  hooks/
  lib/
    auth/
    query/
  pages/
    public/
    admin/
    participant/
    trainer/
    corporate/
  utils/
```

### Backend target structure for later Express.js migration

```text
server/
  src/
    app/
    config/
    middleware/
    modules/
      auth/
      users/
      organizations/
      trainers/
      programs/
      batches/
      enrollments/
      invoices/
      payments/
      assessments/
      attendance/
      feedback/
      certificates/
    db/
    services/
    validators/
```

## 5. Development Plan

### Phase 1: stabilize shared domain rules

1. Extract role model and role-home-path rules into shared domain helpers
2. Extract certificate eligibility into a dedicated domain helper
3. Keep pages consuming these helpers instead of re-implementing logic

### Phase 2: complete operational MVP modules

1. Feedback module MVP
2. Attendance module MVP
3. Assessment module refinement
4. Payment and invoice refinement

### Phase 3: role flow completion

1. Participant end-to-end completion flow
2. Trainer operational views
3. Corporate PIC operational views
4. Admin operational consistency

### Phase 4: Supabase-ready alignment

1. Align local mock entity shape with target schema
2. Separate page logic from domain logic
3. Prepare API service interfaces for later Express backend
4. Document RLS assumptions and role matrix

### Phase 5: backend migration path

1. Introduce Express API routes matching current frontend service contract
2. Move auth to Supabase Auth
3. Move persistence to Supabase PostgreSQL
4. Apply RLS policies
5. Move certificate and file assets to Supabase Storage

## Immediate next coding steps

1. Extract shared domain helpers for:
   - role mapping
   - certificate eligibility
2. Continue Attendance module MVP
3. Continue Assessment module MVP
4. Refine participant completion visibility
