"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function PaymentForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  async function pay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsPaying(true);

    const response = await fetch(`/api/bookings/${bookingId}/pay`, { method: "POST" });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Payment could not be completed.");
      setIsPaying(false);
      return;
    }

    router.refresh();
  }

  return (
    <form className="payment-form" onSubmit={pay}>
      <div className="payment-heading">
        <div><p className="overline">Demo checkout</p><h2>Payment details</h2></div>
        <span className="demo-label">No charge</span>
      </div>
      <label>Cardholder name<input name="cardName" autoComplete="cc-name" required placeholder="Name on card" /></label>
      <label>Card number<input name="cardNumber" autoComplete="cc-number" inputMode="numeric" pattern="[0-9 ]{12,19}" maxLength={19} required placeholder="4242 4242 4242 4242" /></label>
      <div className="payment-row">
        <label>Expiry<input name="expiry" autoComplete="cc-exp" inputMode="numeric" pattern="(0[1-9]|1[0-2])\/[0-9]{2}" required placeholder="MM/YY" /></label>
        <label>Security code<input name="cvc" autoComplete="cc-csc" inputMode="numeric" pattern="[0-9]{3,4}" maxLength={4} required placeholder="CVC" /></label>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-full" disabled={isPaying}>{isPaying ? "Processing…" : "Pay and confirm"}</button>
      <p className="payment-note">This is a demonstration. No payment is processed or stored.</p>
    </form>
  );
}
