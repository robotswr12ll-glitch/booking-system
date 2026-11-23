import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/");

  return (
    <main className="auth-shell">
      <Link className="wordmark" href="/">CourtSide<span>.</span></Link>
      <section className="auth-card">
        <p className="overline">Welcome back</p>
        <h1>Sign in.</h1>
        <p className="auth-intro">Your next game is waiting.</p>
        <LoginForm />
        <p className="auth-switch">New to CourtSide? <Link href="/register">Create an account</Link></p>
      </section>
      <p className="auth-footer">Book your game. Own your time.</p>
    </main>
  );
}
