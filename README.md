# V-TEKI Academy Web

Frontend website for the V-TEKI Academy experience, detached from the original Base44 runtime and configured to run as a standard Vite React app.

## Local run

1. Install dependencies with `npm install`
2. Start the dev server with `npm run dev`
3. Build production assets with `npm run build`

## Local data mode

The app now uses a browser-local adapter in [src/api/appClient.js](</D:/magang/V-TEKI Center of Excellence (CoE)/src/api/appClient.js>) instead of the Base44 SDK. Demo auth and entity data are stored in localStorage so the UI can run without an external backend.

Demo accounts:

- `admin@vteki.local` / `admin123`
- `participant@vteki.local` / `participant123`
# V-TEKI-Center-of-Excellence
