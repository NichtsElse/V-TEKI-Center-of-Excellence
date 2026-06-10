<!--
Purpose: Define the phased development plan for aligning the current MVP with the V-TEKI reference requirements.
Who uses it: Engineers, reviewers, and planning sessions.
Main dependencies: Current codebase, task list, and implementation blueprint.
Public/main sections: Phase breakdown and immediate next steps.
Important side effects: None.
-->

# Development Plan

## Phase 1: Stabilize Shared Business Rules (✅ COMPLETE)

- ✅ extract role mapping into shared domain helpers
- ✅ extract certificate eligibility into shared domain helpers
- ✅ reduce business rules inside page components

## Phase 2: Complete Operational MVP Modules (✅ COMPLETE)

- ✅ feedback module MVP
- ✅ attendance module MVP
- ✅ assessment module refinement
- ✅ payment and invoice refinement

## Phase 3: Complete Role Flows (✅ COMPLETE)

- ✅ participant end-to-end completion flow
- ✅ trainer operational flow
- ✅ corporate PIC operational flow
- ✅ admin operational consistency

## Phase 4: Supabase-Ready Alignment (⏳ IN PROGRESS)

- ✅ align mock entity shape with target schema
- ✅ separate domain logic from page logic
- [ ] define frontend service interfaces for future Express backend
- [ ] document role matrix and RLS assumptions

## Phase 5: Backend Migration Path (⏭️ UPCOMING)

- [ ] introduce Express API routes matching current frontend contract
- [ ] move authentication to Supabase Auth
- [ ] move persistence to Supabase PostgreSQL
- [ ] apply RLS policies
- [ ] move assets to Supabase Storage

## Immediate Next Steps

1. 🎯 Define and document the Express API interfaces for the frontend backend integration.
2. 🗄️ Ensure data persistence logic in `appClient.js` can smoothly transition to API calls.
3. 🔐 Document mapping between local MVP roles and Supabase RLS.
4. 🚀 Prepare repository for Express backend code setup.
