import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  return (
    <main className="auth-page">
      <section className="card">
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in</h1>
        <p className="muted">Use your email and password to access your account.</p>
        <LoginForm />
        <p className="switch-link">
          New here? <Link href="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
