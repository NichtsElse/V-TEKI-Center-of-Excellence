# Project Progress

Last updated: 2026-06-10

## Current Direction

The project stays on the existing stack:

- React + Vite
- local seeded demo data
- Supabase disabled by default

The current priority is finishing MVP features before any stack migration.

## What Is Already Working

- Public pages: home, programs, trainers, demo guide, certificate verification
- Role-based login for:
  - admin
  - trainer
  - participant
  - corporate PIC
- Local demo auth/session flow
- Role-based routing and protected pages
- Local seeded database in `src/api/appClient.js`
- Participant dashboards and program progress
- Admin program, batch, attendance, assessment, feedback, and certificate pages
- Trainer dashboard, batches, attendance, feedback, reports, and assessments pages
- Corporate dashboard, participants, and invoices pages
- Certificate PDF generation
- Certificate eligibility logic
- Mobile public navbar menu

## Recent Fixes

- Disabled Supabase by default so demo data is the main source for the MVP
- Fixed local demo auth fallback for `@vteki.local` accounts
- Fixed public navbar visibility on mobile
- Fixed corporate pages so they resolve organization scope from demo data
- Fixed participant attendance visibility
- Fixed certificate generation filters so eligible demo users can generate certificates
- Fixed trainer identity resolution so trainer dashboards and related views use the correct trainer record
- Updated README and Vite dev config

## Features Still In Progress

- Participant attendance views can still be polished further
- Trainer assessment review flow can be refined
- Trainer feedback/report pages can be tightened up
- Corporate dashboards can be made more explicit for demo presentation
- Some generated bundles are still large and can be split later

## Known Notes

- Supabase exists in the codebase, but it is off by default.
- Demo data is stored in browser LocalStorage.
- The dev server is pinned to `127.0.0.1:4173`.
- Build works, but Vite warns that the main bundle is large.

## Recommended Next Steps

1. Finish trainer assessment and feedback/report polish.
2. Tighten participant progress and attendance presentation.
3. Improve corporate dashboard/invoice demo clarity.
4. Optionally add bundle splitting after the MVP flow is stable.
