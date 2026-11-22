"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    const data = (await response.json()) as { error?: string };
    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to create the account.");
      return;
    }

    router.push("/login");
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label htmlFor="name">Name (optional)</label>
      <input id="name" name="name" type="text" autoComplete="name" maxLength={100} />

      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" autoComplete="email" required />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        maxLength={72}
        required
      />
      <p className="hint">Use between 8 and 72 characters.</p>

      {error && <p className="error" role="alert">{error}</p>}

      <button className="button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
