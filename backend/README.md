# Backend (NestJS)

## Implemented features
- Supabase JWT verification (hybrid auth model).
- RBAC via `@Roles(...)` and `RolesGuard`.
- Currency proxy endpoints (`symbols`, `latest`, `historical`) using backend-only API key.
- Conversion endpoint with fingerprint validation, supported-currency validation, and history persisted to `conversion_history`.
- History listing with optional filters: `fromCurrency`, `toCurrency`, `date`, `dateFrom`, `dateTo`, pagination.
- Supported currencies stored in Supabase (`supported_currencies`).
- Redis-backed caching and rate-limiting support.
- Swagger docs at `/api/docs`.

## Local setup
See `docs/setup.md`.

## Endpoints
- `GET /api/health` (public)
- `GET /api/currency/symbols` (public)
- `GET /api/currency/latest?base=USD` (public)
- `GET /api/currency/historical?base=USD&date=2024-01-01` (public)
- `GET /api/auth/me` (auth required)
- `POST /api/conversions/convert` (auth + `x-device-fingerprint`, body requires `from`, `to`, `amount`)
- `GET /api/conversions/history` (auth; query: `fromCurrency`, `toCurrency`, `date`, `dateFrom`, `dateTo`, `limit`, `offset`)
