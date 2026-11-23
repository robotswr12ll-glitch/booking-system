import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);

  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="CourtSide home">CourtSide<span>.</span></Link>
      <nav className="site-nav" aria-label="Main navigation">
        {session ? (
          <>
            <Link href="/book">Book a court</Link>
            <Link href="/my-bookings">My bookings</Link>
            {session.user.role === "ADMIN" && <Link href="/admin">Admin</Link>}
            <SignOutButton />
          </>
        ) : (
          <>
            <Link href="/book">Explore</Link>
            <Link href="/login">Sign in</Link>
            <Link className="button button-small" href="/register">Join CourtSide</Link>
          </>
        )}
      </nav>
    </header>
  );
}
