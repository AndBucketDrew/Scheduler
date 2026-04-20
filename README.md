# SchedulerApp

This was a school project with a 1.5 month deadline.

A full-stack shift scheduling and workforce management application. Built to handle shift creation, team member management, and a shift swap approval workflow with role-based access control throughout.

---

## What it does

Workers can view their assigned shifts and request swaps with coworkers. Swap requests go through a two-stage approval: the target member accepts or declines first, then a team leader or admin reviews and executes the reassignment. Admins and leaders manage shifts, event types, and team members. All of this is gated by a four-tier RBAC (Role-Based Access Control) system embedded directly in the JWT payload.

---

## Stack

### Frontend

Built with **React 18** and **Vite** as the build toolchain. State is managed with **Zustand**, split into modular slices (auth, events, members, UI).
The calendar view uses the **@schedule-x** library with drag-and-drop and resize plugins, conditionally loaded based on the authenticated user's permissions. **dayjs** for date handling and **@mui/x-date-pickers** for date inputs.

HTTP calls use **axios** with `application/x-www-form-urlencoded` encoding. Token parsing on the client is done with **jwt-decode** to extract role and permissions from the JWT without a round-trip.

### Backend

**Node.js** with **Express**, using ESM modules throughout. 
The database is **MongoDB** hosted on Atlas, accessed via **Mongoose** ODM with schema-level validation. Authentication is JWT-based (**jsonwebtoken**). Passwords are hashed with **bcrypt** salt rounds, stored in a separate collection from the member document to keep the member schema clean and simplify the password reset flow. Input validation and sanitization run through **express-validator** before any controller logic executes.

---

## Architecture decisions worth noting

**Separate password collection.** Member and Password are distinct Mongoose models. This makes the forced-reset flow (the `mustSetPassword` flag) straightforward — new accounts are created without a password, the flag is set, and on first login the user is redirected to set one. The member record itself stays clean.

**JWT payload carries permissions.** Rather than querying the database on every request to resolve what a user can do, the permissions array is embedded in the token at login time. The frontend reads this directly from the decoded token to conditionally render UI elements.


---

## Role hierarchy

| Role | Key permissions |
|---|---|
| super-admin | Full access: edit shifts, manage all users, assign all roles |
| office-leader | Edit shifts, manage users, approve swaps, assign team leaders and workers |
| team-leader | Approve or decline shift swap requests |
| worker | Request shift swaps |

The `ProtectedRoute` component enforces permission requirements at the route level using the decoded token, falling back to the user's own shift view if access is insufficient.

---

## Known limitations and TODOs

- Member deletion does not cascade to associated events.... references remain
- Event type deletion cascades and removes all associated shifts. Id like the behavior to be deassign rather than delete
- Email notifications via nodemailer are configured but not wired into any workflow
- The JWT secret is currently stored in a committed `.env` file because this was a school project.
- There are lots of console.logs() left in the code which is not secure.
- Frontend styling needs work

---

## Running locally

```bash
# Backend
cd backend
npm install
npm start        # nodemon on port 8000

# Frontend
cd frontend
npm install
npm run dev      # Vite dev server
```

Requires a MongoDB connection string in `backend/.env` as `MONGO_URI`, and a `JWT_SECRET`.
