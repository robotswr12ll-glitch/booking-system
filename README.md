# Booking System

A Next.js 14 App Router application with TypeScript, PostgreSQL, Prisma, and Auth.js credentials authentication.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a PostgreSQL database, then copy `.env.example` to `.env` and set `DATABASE_URL`, `NEXTAUTH_URL`, and a strong random `NEXTAUTH_SECRET`.

3. Apply the initial migration and generate Prisma Client:

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Create an account at `/register`, then sign in at `/login`.

## Database

`prisma/schema.prisma` defines:

- `User`: account details and a bcrypt password hash.
- `Item`: name, description, and total available quantity.
- `Booking`: user/item relations, start and end dates, and `PENDING`, `CONFIRMED`, or `CANCELLED` status.

The initial PostgreSQL migration is in `prisma/migrations/20261122000000_init/migration.sql`.

## Commands

```bash
npm run dev    # Development server
npm run build  # Production build
npm run lint   # ESLint
```
