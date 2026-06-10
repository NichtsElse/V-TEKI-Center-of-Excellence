# V-TEKI Center of Excellence (CoE) Platform

V-TEKI CoE is a local-first MVP frontend for training, certification, attendance, assessment, and corporate reporting flows. The app currently runs with seeded demo data in the browser so you can explore every role without needing a live backend.

## What You Can Do

- Browse public programs, trainers, and certificate verification pages.
- Sign in as admin, trainer, participant, or corporate PIC.
- Review batches, attendance, assessments, feedback, invoices, and certificates.
- Use the demo data immediately after running the app locally.

## Tech Stack

- React 18
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- Shadcn UI components
- LocalStorage demo data adapter

## Run Locally

1. Open a terminal in the project folder.
2. Install dependencies:

```bash
npm install
```

3. Start the dev server:

```bash
npm run dev
```

4. Open the app:

```text
http://127.0.0.1:4173
```

If the port is busy, Vite will stop instead of switching ports because `strictPort` is enabled in `vite.config.js`.

## Build

```bash
npm run build
```

## Demo Accounts

Use these local demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@vteki.local` | `admin123` |
| Trainer | `trainer@vteki.local` | `trainer123` |
| Corporate PIC | `corporate@vteki.local` | `corporate123` |
| Participant | `participant@vteki.local` | `participant123` |

## Supabase Mode

Supabase is disabled by default so the app stays fully usable offline with demo data.

To enable Supabase explicitly:

```env
VITE_ENABLE_SUPABASE=true
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

- `src/pages` - role-based pages for public, admin, trainer, corporate, and participant flows.
- `src/components` - shared UI, layout, and reusable components.
- `src/api` - local app adapter and data access helpers.
- `src/domain` - business rules and role/eligibility helpers.
- `src/lib` - auth, routing, and runtime helpers.
- `src/validators` - validation utilities and tests.

## Notes

- The app uses local seeded data by default.
- Demo data is stored in browser LocalStorage.
- The dev server is configured to run on `127.0.0.1:4173`.
