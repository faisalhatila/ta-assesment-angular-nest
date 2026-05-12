# Backend Setup

## Local prerequisites
- Node.js 20+
- Docker Desktop (for local Redis)
- Supabase project

## Steps
1. Copy `backend/.env.example` to `backend/.env` and fill all values.
2. Start Redis from project root:
   - `docker compose up -d redis`
3. Apply SQL from `backend/docs/supabase-schema.sql` in Supabase SQL editor (full schema). If you already applied an older schema and only need `conversion_history`, run `backend/docs/supabase-conversion-history.sql` instead.
4. Ensure all intended currencies exist in `supported_currencies`.
5. Install packages:
   - `npm install` at root
   - `npm --prefix backend install`
6. Start backend:
   - `npm --prefix backend run start:dev`
7. Verify:
   - Health: `http://localhost:3000/api/health`
   - Swagger: `http://localhost:3000/api/docs`
