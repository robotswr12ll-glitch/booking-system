import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { RegisterForm } from "@/components/register-form";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/");

  return (
    <main className="auth-shell">
      <Link className="wordmark" href="/">CourtSide<span>.</span></Link>
      <section className="auth-card">
        <p className="overline">Join the club</p>
        <h1>Create your account.</h1>
        <p className="auth-intro">A simpler way to make time for sport.</p>
        <RegisterForm />
        <p className="auth-switch">Already a member? <Link href="/login">Sign in</Link></p>
      </section>
      <p className="auth-footer">Book your game. Own your time.</p>
    </main>
  );
}
