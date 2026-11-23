# CourtSide

Book your game. Own your time.

A premium sports facility booking app built with Next.js 14, TypeScript, PostgreSQL, Prisma, and Auth.js credentials authentication.

## Local setup

1. Install dependencies and create a PostgreSQL database.
2. Copy `.env.example` to `.env` and configure `DATABASE_URL`, `NEXTAUTH_URL`, and a strong random `NEXTAUTH_SECRET`.
3. Apply migrations and seed the facilities and admin account:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. Start the application:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Seeded admin

- Email: `admin@courtside.com`
- Password: `admin123`

Change this password before using the account in a public production environment.

## Customer flow

Register or sign in, open `/book`, choose a sport, date, duration, and start time. CourtSide automatically assigns an available facility. Complete the demo payment to confirm the reservation, then manage it from `/my-bookings`.

## Administration

`/admin` is restricted to users with the `ADMIN` role. Administrators can filter every reservation by date, sport, and status, cancel upcoming bookings, and mark bookings as completed.

## Railway deployment

Set `DATABASE_URL`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET` on the application service. Run migrations and the seed against the Railway database before using the new version:

```bash
npm run db:migrate
npm run db:seed
```

The build command runs `prisma generate && next build`, so Prisma Client is generated during deployment.

## Commands

```bash
npm run dev         # Development server
npm run build       # Generate Prisma Client and create a production build
npm run lint        # ESLint
npm run db:migrate  # Apply committed Prisma migrations
npm run db:seed     # Seed facilities and the admin account
```
