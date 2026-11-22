import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { RegisterForm } from "@/components/register-form";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  return (
    <main className="auth-page">
      <section className="card">
        <p className="eyebrow">Get started</p>
        <h1>Create an account</h1>
        <p className="muted">Register with your email and a secure password.</p>
        <RegisterForm />
        <p className="switch-link">
          Already registered? <Link href="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
