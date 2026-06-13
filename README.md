# CareerConnect

CareerConnect is a full-stack career portal for students, interviewers, and administrators. It combines job discovery, resume uploads, ATS-style resume matching, application tracking, interview workflow support, notifications, and admin moderation in one React + Express application.

## Features

- Role-based authentication for students, interviewers, and admins
- Student dashboard with jobs, applications, profile, resume, and career resources
- Interviewer dashboard for managing posted opportunities and candidates
- Admin dashboard for user moderation and approval workflows
- Resume upload and parsing support with ATS keyword scoring
- Job applications with application status tracking
- In-app notifications and email notifications
- Password reset flow using OTP codes stored in Redis
- PostgreSQL persistence through Sequelize models
- Vite development server with API and upload proxying

## Tech Stack

**Frontend**

- React 19
- Vite
- React Router
- Tailwind CSS
- Framer Motion
- Lucide React

**Backend**

- Node.js
- Express
- PostgreSQL
- Sequelize
- JWT authentication
- Redis
- Nodemailer
- Multer
- pdf-parse

## Project Structure

```text
CareerConnect-IntegratedProject/
|-- public/                 # Static frontend assets
|-- src/                    # React application
|   |-- components/         # Shared layout and UI components
|   |-- context/            # Auth and alert contexts
|   `-- pages/              # Route-level pages
|-- server/                 # Express API
|   |-- config/             # Database configuration
|   |-- db/                 # SQL schema and seed files
|   |-- middleware/         # Auth middleware
|   |-- models/             # Sequelize models
|   |-- routes/             # API route modules
|   `-- utils/              # Email, Redis, and ATS helpers
|-- package.json            # Frontend/root scripts
|-- vite.config.js          # Vite config and API proxy
`-- vercel.json             # Deployment routing config
```

## Prerequisites

Install these before running the project:

- Node.js and npm
- PostgreSQL
- Redis, if you want password reset OTPs to work locally
- A Gmail app password, only if you want real email delivery instead of local mock email logs

## Environment Variables

Create a `.env` file inside the `server/` directory.

```env
PORT=5000
NODE_ENV=development

# Use either DATABASE_URL or the individual DB values below
DATABASE_URL=
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=careerconnect

JWT_SECRET=replace-with-a-secure-secret

# Redis, used by forgot/reset password OTP flow
REDIS_UNAME=
REDIS_PASS=
REDIS_HOST=localhost
REDIS_PORT=6379

# Optional Gmail SMTP credentials
EMAIL_USER=
EMAIL_APP_PASSWORD=
```

If `DATABASE_URL` is set, the backend uses it. Otherwise it falls back to the individual PostgreSQL settings.

If email credentials are not set, emails are generated with Nodemailer's mock JSON transport and logged to `server/logs/emails.log` when possible.

## Getting Started

1. Install dependencies from the project root:

   ```bash
   npm install
   ```

   The root `postinstall` script also installs backend dependencies inside `server/`.

2. Create the PostgreSQL database:

   ```sql
   CREATE DATABASE careerconnect;
   ```

3. Add your backend environment file at `server/.env`.

4. Set up the database schema and starter users:

   ```bash
   node server/setup-db.js
   ```

5. Seed sample jobs and applications:

   ```bash
   node server/seedJobs.js
   ```

6. Start the full development app:

   ```bash
   npm run dev
   ```

The frontend runs through Vite, and API calls are proxied to the backend at `http://127.0.0.1:5000`.

## Available Scripts

Run these from the project root:

```bash
npm run dev              # Start frontend and backend together
npm run dev:frontend     # Start only the Vite frontend
npm run dev:backend      # Start only the Express backend with nodemon
npm run build            # Build the frontend for production
npm run preview          # Preview the production frontend build
npm run lint             # Run ESLint
```

Backend scripts can also be run from `server/`:

```bash
npm run dev              # Start Express with nodemon
npm start                # Start Express with node
```

## Demo Accounts

After running `server/setup-db.js` and `server/seedJobs.js`, these sample accounts are available:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@careerconnect.com` | `password123` |
| Interviewer | `interviewer@gmail.com` | `interviewer` |
| Student | `student@gmail.com` | `student` |

The SQL seed also creates extra demo users such as `interviewer1@careerconnect.com` and `student1@university.edu`; those seeded SQL accounts use the same sample hash as the admin account.

## API Overview

The backend exposes these main API groups:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `/api/jobs`
- `/api/applications`
- `/api/resumes`
- `/api/notifications`
- `/api/profile`
- `/api/resources`
- `/api/admin`
- `/api/users`
- `GET /api/health`

## Deployment Notes

The app includes `vercel.json` for Vercel routing. For production, configure:

- `DATABASE_URL` for a hosted PostgreSQL database
- `JWT_SECRET`
- Redis credentials if password reset should be enabled
- Email credentials if real notifications should be delivered

The backend enables SSL for `DATABASE_URL` when `NODE_ENV=production`.

## Notes for Contributors

- Keep frontend API calls under `/api` so Vite and deployment proxies can route them correctly.
- Keep uploaded files under the backend upload path exposed by `/uploads`.
- Use Sequelize models and route modules for backend changes instead of putting new domain logic directly in `server.js`.
- Run `npm run lint` before submitting changes.
