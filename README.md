# V-TEKI Center of Excellence (CoE) Platform

Welcome to the **V-TEKI Academy Web Platform** MVP! This repository contains the frontend application for the V-TEKI learning management ecosystem.

Currently, this application is configured to run as a local MVP preview using a browser-local data adapter (LocalStorage) to simulate backend API interactions without requiring an external database.

## 🚀 Key Features by Role

The platform supports multiple user roles, each with custom dashboards and capabilities:

- **👑 Admin (Academy / Super Admin)**
  - Manage Programs, Batches, and Assessments.
  - Approve Registrations and Verify Payments.
  - Track Attendance and Review Feedback.
  - Generate and Manage Certificates.
  
- **👨‍🏫 Trainer (Instructor)**
  - View Assigned Classes (Batches).
  - Record Student Attendance.
  - Grade Assessments and Give Feedback.
  - View Class Performance Reports.

- **🏢 Corporate PIC**
  - Monitor Corporate Participants and Registrations.
  - View Corporate Invoices and Billing Status.
  - View Certificate Readiness for their staff.

- **🎓 Participant (Student)**
  - Browse and Register for Programs.
  - Access Learning Materials and Take Assessments.
  - Submit Program Feedback.
  - Track Progress and Download Certificates.

## 🛠 Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS & Vanilla CSS
- **UI Components**: Shadcn UI (Radix UI + Lucide Icons)
- **State Management**: React Query (@tanstack/react-query)
- **Routing**: React Router DOM
- **Data Storage**: LocalStorage (MVP Mock Adapter)

## 💻 How to Run Locally

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/username/V-TEKI-Center-of-Excellence.git
   cd V-TEKI-Center-of-Excellence
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npx vite --host 127.0.0.1 --port 4173
   ```

4. **Build for production** (optional):
   ```bash
   npm run build
   ```

## 🔐 Demo Accounts

Use the following credentials to explore the different role perspectives locally:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@vteki.local` | `admin123` |
| **Trainer** | `trainer@vteki.local` | `trainer123` |
| **Corporate PIC** | `corporate@vteki.local`| `corporate123` |
| **Participant** | `participant@vteki.local`| `participant123` |

## 📁 Project Structure

- `/src/pages` - Page components organized by role (`/admin`, `/trainer`, `/corporate`, `/participant`, `/public`).
- `/src/components` - Shared UI components, layouts, and Shadcn primitives (`/ui`).
- `/src/api` - The LocalStorage mocked data adapter (`appClient.js`).
- `/src/domain` - Business logic and entity helpers.
- `/src/validators` - Form and entity schema validation.

---
*Built for the V-TEKI Center of Excellence MVP.*
