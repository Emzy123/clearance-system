# Presenter Guide

## Pre-demo checklist (15-20 mins before)

1. Run `npm install` at workspace root.
2. Verify `server/.env` and `client/.env` are set correctly.
3. Reset demo data with `npm run demo:reset`.
4. Start the app with `npm run dev`.
5. Open:
   - API health: `http://localhost:5000/api/health`
   - Client: `http://localhost:5173`
6. (Optional) run `npm run test:smoke` in a second terminal.

## Suggested demo flow (7-10 minutes)

1. **Admin setup**
   - Login as `admin@demo.edu` / `AdminPass123!`
   - Show departments and phase configuration.
   - Show analytics dashboard/reports.

2. **Student journey**
   - Login as `student1@demo.edu` / `StudentPass123!`
   - Open clearance status page.
   - Submit required sequential document.
   - Show notifications/progress update.

3. **Staff approval**
   - Login as `staff1@demo.edu` / `StaffPass123!`
   - Approve/reject from pending requests.
   - Return to student account to show status progression.

4. **Completion**
   - Show transition to parallel phase and final certificate readiness.

## Fallback plan

- If mail is unavailable, continue with in-app notifications.
- If socket updates lag, refresh the page to fetch latest API state.
- If test data is inconsistent, run `npm run demo:reset` and restart login flow.

## Post-demo quick checks

- Run `npm run build` to confirm release bundle still passes.
- Rotate any temporary credentials used in shared/demo environments.
