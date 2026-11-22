import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="home">
      <nav className="nav">
        <Link className="brand" href="/">Booking System</Link>
        {session ? (
          <SignOutButton />
        ) : (
          <div className="nav-links">
            <Link className="button secondary" href="/login">Sign in</Link>
            <Link className="button" href="/register">Create account</Link>
          </div>
        )}
      </nav>

      <section className="hero">
        <p className="eyebrow">Next.js 14 · PostgreSQL · Prisma</p>
        <h1>Book what you need,<br />when you need it.</h1>
        <p className="hero-copy">
          A booking foundation with users, inventory, reservations, and secure credentials authentication.
        </p>

        {session ? (
          <div className="account-card">
            <span className="status-dot" aria-hidden="true" />
            <div>
              <strong>Signed in as {session.user.name || session.user.email}</strong>
              <p>{session.user.email}</p>
            </div>
          </div>
        ) : (
          <div className="hero-actions">
            <Link className="button" href="/register">Get started</Link>
            <Link className="text-link" href="/login">I already have an account →</Link>
          </div>
        )}
      </section>
    </main>
  );
}
