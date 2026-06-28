# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

```bash
# Install all dependencies (first time setup)
npm install && npm run install:all

# Start both frontend and backend concurrently
npm run dev

# Start individually
npm run dev:server   # Express server on http://localhost:3001
npm run dev:client   # Vite dev server on http://localhost:5174
```

### Build

```bash
npm run build   # Builds client to client/dist/
```

### Testing

```bash
# Run all tests
make test

# Server tests only (Jest)
cd server && npx jest --forceExit

# Run a single server test file
cd server && npx jest --forceExit __tests__/api.test.js

# Client tests only (Vitest)
cd client && npx vitest run

# Run a single client test file
cd client && npx vitest run src/__tests__/hooks.test.ts
```

### Deployment

```bash
make sync    # rsync project to remote server (excludes node_modules, dist, resume JSON data)
make start   # SSH into remote server and start the app
```

## Architecture

This is a monorepo with a React frontend (`client/`) and an Express backend (`server/`). The root `package.json` coordinates both via `concurrently`.

### Backend (`server/`)

- **`server.js`** — Entry point. Loads `.env` from the repo root (`../`), mounts routes, ensures the data directory exists before listening on port 3001.
- **`routes/resumes.js`** — CRUD REST API for resumes (`GET/POST/PUT/DELETE /api/resumes`). Resumes are persisted as individual JSON files under `data/resumes/{uuid}.json`.
- **`routes/ai.js`** — AI polish endpoint (`POST /api/ai/polish`). Calls an OpenAI-compatible API configured via environment variables. Supports polish `type` values: `summary`, `highlight`, `skill`.
- **`utils/fileStorage.js`** — File I/O helpers (`listResumes`, `readResume`, `writeResume`, `deleteResume`, `ensureDir`).

### Frontend (`client/src/`)

- **`App.tsx`** — Router root. Three routes: `/` (Home), `/editor/new`, `/editor/:id`.
- **`pages/Home.tsx`** — Resume list page with create/delete actions.
- **`pages/Editor.tsx`** — Split-pane editor: left = form sections, right = live template preview. Handles both create (no ID) and edit (with ID) flows.
- **`services/api.ts`** — Axios client with base URL `/api` (proxied to port 3001 in dev). Exports `resumeApi` and `aiApi`.
- **`hooks/useResume.ts`** — Manages load/save state for a single resume. `isNew` flag drives create vs update.
- **`hooks/useResumeList.ts`** — Manages the resume list for the Home page.
- **`types/resume.ts`** — Canonical TypeScript types (`Resume`, `PersonalInfo`, `WorkExperience`, `ProjectExperience`, `OrganizationExperience`, `Skill`).

### Template System

Templates live in `client/src/templates/` and are registered in `registry.ts`. Each template is a React component accepting a single `resume: Resume` prop. To add a new template:

1. Create `client/src/templates/YourTemplate.tsx`
2. Add an entry to the `templateRegistry` array in `registry.ts`

Current templates: `professional` (blue theme, photo), `minimal` (black/white, no photo), `modern` (two-column, dark sidebar).

### PDF Export

Export is handled by `react-to-print` via `ExportButton.tsx`. It prints the live template preview DOM node directly, so template CSS must be print-safe.

### AI Polish

`AIPolishButton.tsx` calls `POST /api/ai/polish` with `{ text, type }`. The backend proxies to any OpenAI-compatible endpoint. If env vars are missing, the endpoint returns 503 and the button is effectively disabled.

## Environment Variables

Copy `.env.example` to `.env` in the repo root:

```
RESUME_AI_MODEL=gpt-4o-mini
RESUME_AI_AK=your-api-key-here
RESUME_AI_BASEURL=https://api.openai.com/v1
```

The server reads `.env` at `../` relative to `server/`, so the file must live at the repo root.

## Data Storage

Resume JSON files are stored at `data/resumes/{uuid}.json`. This directory is excluded from `make sync` to preserve production data across deploys.
