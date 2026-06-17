ETHARA PMS - README

Project Overview
- Name: Ethara PMS (Project Management System)
- Purpose: A full-stack project management application with user authentication, teams, projects, tasks, notifications, real-time updates via WebSocket, file uploads, and email notifications.
- Layout: Separate `client` (React + Vite) and `server` (Node.js + Express + MongoDB) folders.

Repository Structure (top-level)
- client/                -> Frontend React app (Vite)
- server/                -> Backend Express app
- uploads/               -> filesystem storage for attachments and avatars (used by server)

Important source areas (frontend)
- client/src/
  - api/                 -> API helper modules for auth, users, projects, tasks, teams, notifications
  - components/          -> UI components and layout (AppLayout, Sidebar, TopBar, NotificationDropdown)
  - context/             -> `AuthContext.jsx`, `SocketContext.jsx` (auth state and socket provider)
  - pages/               -> Route pages: auth, dashboard, projects, tasks, teams, members, settings
  - routes/              -> `AppRouter.jsx`, `ProtectedRoute.jsx`, `RoleRoute.jsx`

Important source areas (backend)
- server/app.js          -> Express app setup and middleware registration
- server/server.js       -> App entry and HTTP+Socket server startup
- server/config/         -> `env.js`, `db.js`, `nodemailer.js` (config helpers)
- server/middleware/     -> auth, validation, roleGuard, upload, errorHandler
- server/models/         -> Mongoose models (User, Project, Task, Team, Notification, Comment, Canvas)
- server/modules/        -> Feature modules: auth, dashboard, notification, project, task, team, user (routes, controllers, services)
- server/socket/         -> Socket.io initialization and socket middleware
- uploads/attachments/   -> Uploaded task/project files
- uploads/avatars/       -> User avatar uploads
- server/utils/          -> `apiResponse.js`, `paginate.js`, `tokens.js`

Key Files
- client/package.json    -> frontend scripts and dependencies
- server/package.json    -> backend scripts and dependencies
- server/config/env.js   -> required environment variables (validated on startup)

Environment variables (required & optional)
- REQUIRED (checked in `server/config/env.js`):
  - MONGO_URI            -> MongoDB connection string
  - JWT_ACCESS_SECRET    -> Secret for access tokens
  - JWT_REFRESH_SECRET   -> Secret for refresh tokens
  - CLIENT_URL           -> Frontend client URL (used for CORS and email links)

- OPTIONAL / RECOMMENDED (used by config):
  - PORT                 -> Server port (default: 5000)
  - JWT_ACCESS_TTL       -> Access token TTL (default: 15m)
  - JWT_REFRESH_TTL      -> Refresh token TTL (default: 7d)
  - NODE_ENV             -> `development` or `production` (default: development)
  - SMTP_HOST            -> SMTP hostname for emails
  - SMTP_PORT            -> SMTP port (default: 587)
  - SMTP_USER            -> SMTP username
  - SMTP_PASS            -> SMTP password
  - FROM_EMAIL           -> Default email from address (default: noreply@ethara.ai)

Sample `.env` (server root)
MONGO_URI=mongodb://localhost:27017/ethara-pms
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CLIENT_URL=http://localhost:3000
PORT=5000
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASS=yourpassword
FROM_EMAIL=noreply@ethara.ai

Frontend (client) - Quick Start
Prereqs:
- Node.js (>=16 recommended)

Install dependencies (client):
- From `client` directory run:
  npm install

Useful npm scripts (client/package.json):
- `npm run dev`       -> Start Vite dev server (hot reloading)
- `npm run build`     -> Build production bundle (dist/)
- `npm run preview`   -> Serve production build locally via Vite preview
- `npm run lint`      -> Run ESLint checks

Running client:
- Development: `npm run dev` (defaults to port defined by Vite, commonly 5173)
- Build for production: `npm run build`
- Preview production build: `npm run preview`

Backend (server) - Quick Start
Prereqs:
- Node.js (>=16)
- MongoDB instance (local or hosted)

Install dependencies (server):
- From `server` directory run:
  npm install

Useful npm scripts (server/package.json):
- `npm run start`     -> Start server using `node server.js` (production)
- `npm run dev`       -> Start server with auto-reload using `node --watch server.js` (development)

Running server locally:
- Ensure `.env` is present at `server/.env` or environment variables are exported.
- Start MongoDB, then from `server` run:
  npm run dev
- The server listens on `PORT` (default 5000). Socket.io and HTTP server start from `server/server.js`.

Database and Models
- Uses MongoDB via Mongoose.
- Models are in `server/models/` and include: User, Project, Task, Team, Notification, Comment, Canvas.
- If you need to seed or migrate, implement a script under `server/scripts/` (not provided).

Authentication & Authorization
- JWT-based auth with access and refresh tokens.
- Token settings and secrets are in environment variables.
- Role-based access is enforced via `server/middleware/roleGuard.js` and `modules/*/*.route.js`.

File uploads
- Multer is used for handling uploads (`multer` dependency in `server/package.json`).
- Uploaded files are stored under `uploads/attachments/` and avatars under `uploads/avatars/`.
- `server/middleware/upload.js` controls allowed types and limits.

Email notifications
- Uses `nodemailer` with SMTP configuration found in environment variables and `server/config/nodemailer.js`.
- Ensure SMTP credentials are valid for sending invitation, password reset, or notification emails.

Real-time notifications and sockets
- Socket.io is used for realtime updates (`socket.io` on server and `socket.io-client` in client)
- Initialization occurs in `server/socket/index.js` and client `SocketContext.jsx`.
- Socket authentication is handled via `server/socket/middleware/socketAuth.js`.

API endpoints (high-level)
- Auth: `/api/auth` -> login, register, refresh tokens, logout
- Users: `/api/users` -> user CRUD, profile, avatar upload
- Projects: `/api/projects` -> create/list/detail/update/delete projects
- Tasks: `/api/tasks` -> create/list/update/delete tasks, comments
- Teams: `/api/teams` -> manage teams and memberships
- Notifications: `/api/notifications` -> list, mark-read, push

(See each module folder under `server/modules` for exact route paths and controller actions.)

Development notes
- CORS: server allows requests from `CLIENT_URL` defined in environment config.
- Security: `helmet`, `express-rate-limit`, `cors`, and input validations are used.
- Logging: `morgan` is enabled for HTTP request logging in development.

Testing & Linting
- Frontend contains ESLint; run `npm run lint` from `client`.
- Add unit/integration tests as needed (no test runner configured by default).

Building & Deployment
- Build frontend with `client/npm run build` and serve static assets (e.g., with `serve`, nginx, or integrated with Node static middleware).
- Server can be deployed to any Node hosting (Heroku, DigitalOcean, AWS). Ensure environment variables and MongoDB connection are configured.
- For production, set `NODE_ENV=production`, use process managers like `pm2` or `systemd`, and enable HTTPS via reverse proxy.

Useful commands (quick copy)
- Client install + dev:
  cd client
  npm install
  npm run dev

- Server install + dev:
  cd server
  npm install
  copy ..\server\.env.example .env   # create .env using example values (adapt for Windows shell)
  npm run dev

Troubleshooting
- "Missing required env variable" at server startup: ensure `.env` has `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `CLIENT_URL`.
- MongoDB connection errors: confirm MongoDB URI, authentication, and that the database server is reachable.
- Email sending failures: verify SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS.
- Socket connection issues: confirm same client URL/origin and that server socket is reachable; check socket auth token.

Contributing
- Fork the repository, create a feature branch, and open PRs with clear descriptions.
- Follow existing code style; run ESLint on client changes.

Licensing
- No explicit license file in repository. Add a `LICENSE` file if you intend to apply an open-source license.

Contact
- Project maintainers: check `package.json` author fields or repository host for contact details.

Files referenced in this README
- server config: server/config/env.js
- client scripts: client/package.json
- server scripts: server/package.json

---
End of README
