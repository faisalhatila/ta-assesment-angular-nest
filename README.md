# Angular + Nest Technical Assessment

Monorepo structure:
- `backend/` NestJS API (implemented first)
- `frontend/` Angular 19 app (placeholder for next phase)

## Quick start (local)
1. Install dependencies:
   - `npm install`
   - `npm --prefix backend install`
   - `npm --prefix frontend install`
2. Start local Redis:
   - `docker compose up -d redis`
3. Configure backend env:
   - copy `backend/.env.example` to `backend/.env`
4. Run backend:
   - `npm run dev:backend`
5. Run both (frontend placeholder + backend):
   - `npm run dev`

## Backend API
- Base URL: `http://localhost:3000/api`
- Swagger docs: `http://localhost:3000/api/docs`
- Health: `GET /api/health`

## Required environment variables
See `backend/.env.example`.

## Deployment (Vercel-first)
- Deploy backend as Vercel Node serverless function with all backend env vars.
- Use Upstash Redis URL for `REDIS_URL`.
- Deploy frontend as static app on Vercel and set backend base URL env in frontend.

## Assessor checklist
- Frontend URL: to be added after Angular implementation.
- Backend URL: to be added after deployment.
- Swagger URL: `${BACKEND_URL}/api/docs`
- Test user credentials: Supabase-authenticated account.
