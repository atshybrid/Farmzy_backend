
Farmzy Backend Starter
======================

Contents:
- Express + TypeScript server (src/)
- Prisma schema + initial migration (prisma/)
- Dockerfile + docker-compose.yml for local dev (Postgres)
- .env.example with placeholders

Quick start (local with Docker):
1. Copy .env.example -> .env and update values.
2. Start DB:
   docker-compose up -d
3. Install deps:
   npm install
4. Generate Prisma client and run migrations:
   npx prisma generate
   npx prisma migrate deploy --preview-feature
5. Start dev server:
   npm run dev

API Endpoints (examples):
- POST /auth/verifyToken  -> Verify Firebase ID token
- GET  /products         -> List products
- POST /orders           -> Create order (auth required)
- GET  /orders/:id       -> Get order

