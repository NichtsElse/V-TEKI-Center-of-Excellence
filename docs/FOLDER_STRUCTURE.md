<!--
Purpose: Describe the current and recommended project folder structure for the V-TEKI platform.
Who uses it: Engineers and maintainers organizing future implementation work.
Main dependencies: Current frontend project layout and planned backend migration path.
Public/main sections: Current structure, recommended frontend structure, and future backend structure.
Important side effects: None.
-->

# Folder Structure

## Current Frontend Structure

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

## Recommended Frontend Structure

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

## Recommended Backend Structure

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

## Structure Guidelines

- pages render UI and orchestration only
- domain folders hold business logic
- api folders abstract storage/backend access
- shared components should avoid business-specific rules
- future backend modules should map to core business domains
