"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CancelBookingButton({ id }: { id: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function cancelBooking() {
    setIsLoading(true);
    setError("");
    const response = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Unable to cancel this booking.");
      setIsLoading(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="booking-action">
      <button className="text-button" type="button" onClick={cancelBooking} disabled={isLoading}>
        {isLoading ? "Cancelling…" : "Cancel booking"}
      </button>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
