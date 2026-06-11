# Supabase Integration Status

**Date**: June 11, 2026
**Current Mode**: Local-first MVP
**Status**: Disabled by default for the demo flow

## Current Setup

- `src/lib/supabase.js` exists and can create a Supabase client.
- `isSupabaseConfigured()` guards Supabase access in the app client.
- The current MVP does not require Supabase to run.
- Local demo auth and LocalStorage-backed data are the default path.

## What Is Active In The Demo

- Browser-local authentication
- Browser-local seeded data
- Role-based UI and routing
- Certificate eligibility logic
- Certificate PDF generation
- Admin invoice creation and payment verification

## What Is Not Active In The Demo

- Supabase database access
- Supabase Auth
- RLS policies
- Express.js backend routes
- Cloud persistence

## Future Migration Notes

If the project returns to Supabase later, the next steps are:

1. Create the database schema.
2. Migrate auth to Supabase Auth.
3. Add RLS policies.
4. Move CRUD calls from local storage to backend-backed APIs.
5. Re-test the demo flows end to end.

## Summary

| Item | Status | Notes |
|------|--------|-------|
| Supabase Client Support | Ready | Optional future path |
| Current Demo Mode | Active | LocalStorage-backed |
| Authentication | Local demo | Works without backend |
| Database Schema | Not active | Not required for current demo |
| RLS Policies | Not active | Future migration item |

**Current Status**: Local-first MVP  
**Supabase**: Disabled by default  
**Migration**: Deferred until the demo flow is stable
