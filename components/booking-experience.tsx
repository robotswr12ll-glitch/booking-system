"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import {
  FacilityWithAvailability,
  formatDate,
  formatHour,
  HOURS,
  SPORTS,
} from "@/lib/booking";

export function BookingExperience({
  initialFacilities,
  initialDate,
  isAuthenticated,
}: {
  initialFacilities: FacilityWithAvailability[];
  initialDate: string;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [facilities, setFacilities] = useState(initialFacilities);
  const [date, setDate] = useState(initialDate);
  const [sport, setSport] = useState<(typeof SPORTS)[number]>("Basketball");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [duration, setDuration] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError("");
    setStartTime(null);

    fetch(`/api/facilities?date=${date}`, { signal: controller.signal })
      .then(async (response) => {
        const data = (await response.json()) as { facilities?: FacilityWithAvailability[]; error?: string };
        if (!response.ok || !data.facilities) throw new Error(data.error ?? "Unable to load availability.");
        setFacilities(data.facilities);
      })
      .catch((reason: Error) => {
        if (reason.name !== "AbortError") setError(reason.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [date]);

  const sportFacilities = useMemo(
    () => facilities.filter((facility) => facility.sport === sport),
    [facilities, sport],
  );
  const pricePerHour = sportFacilities[0]?.pricePerHour ?? 0;

  function isAvailable(hour: number) {
    return sportFacilities.some((facility) =>
      Array.from({ length: duration }, (_, index) => hour + index).every((slot) =>
        facility.availableHours.includes(slot),
      ),
    );
  }

  async function createBooking() {
    if (startTime === null) {
      setError("Choose a start time.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sport, date, startTime, duration }),
    });
    const data = (await response.json()) as { booking?: { id: string }; error?: string };

    if (!response.ok || !data.booking) {
      setError(data.error ?? "Unable to create the booking.");
      setIsSubmitting(false);
      if (response.status === 409) router.refresh();
      return;
    }

    router.push(`/booking/confirm?id=${data.booking.id}`);
  }

  return (
    <div className="booking-layout">
      <section className="booking-main">
        <div className="booking-controls">
          <label className="date-control"><span>Booking date</span><input type="date" min={initialDate} value={date} onChange={(event) => setDate(event.target.value)} /></label>
          <div className="duration-control"><label htmlFor="duration">Duration</label><select id="duration" value={duration} onChange={(event) => { setDuration(Number(event.target.value)); setStartTime(null); }}>{[1, 2, 3, 4, 5].map((hours) => <option key={hours} value={hours}>{hours} {hours === 1 ? "hour" : "hours"}</option>)}</select></div>
        </div>

        <div className="sport-tabs" role="tablist" aria-label="Choose a sport">
          {SPORTS.map((item) => (
            <button key={item} role="tab" aria-selected={sport === item} className={sport === item ? "active" : ""} onClick={() => { setSport(item); setStartTime(null); }}>
              <Icon name={item} /><span>{item}</span>
            </button>
          ))}
        </div>

        <div className="facility-heading"><div><p className="overline">Facilities</p><h2>{sport}</h2></div><span>{sportFacilities.length} spaces</span></div>
        <div className="facility-grid">
          {sportFacilities.map((facility) => (
            <article className="facility-card" key={facility.id}>
              <div><h3>{facility.name}</h3><p>${facility.pricePerHour} / hour</p></div>
              <div className="facility-availability">
                <span>{facility.availableHours.length} start times available</span>
                <div>{facility.availableHours.length > 0 ? facility.availableHours.slice(0, 5).map((hour) => <span key={hour}>{formatHour(hour)}</span>) : <span className="unavailable-label"><Icon name="X" /> Fully booked</span>}</div>
              </div>
            </article>
          ))}
        </div>

        <section className="time-section">
          <div className="facility-heading"><div><p className="overline">Start time</p><h2>Choose your slot</h2></div><span>{formatDate(`${date}T00:00:00.000Z`)}</span></div>
          {isLoading ? <p className="loading-state">Checking availability…</p> : (
            <div className="time-grid">
              {HOURS.map((hour) => {
                const available = hour + duration <= 22 && isAvailable(hour);
                return <button key={hour} className={startTime === hour ? "selected" : ""} disabled={!available || isSubmitting} onClick={() => { setStartTime(hour); setError(""); }} aria-pressed={startTime === hour} aria-label={`${formatHour(hour)}${available ? "" : ", unavailable"}`}><Icon name={available ? "Clock" : "X"} /><span>{formatHour(hour)}</span></button>;
              })}
            </div>
          )}
        </section>
      </section>

      <aside className="booking-summary">
        <p className="overline">Your reservation</p>
        <h2>{sport}</h2>
        <dl>
          <div><dt><Icon name="Calendar" />Date</dt><dd>{formatDate(`${date}T00:00:00.000Z`)}</dd></div>
          <div><dt><Icon name="Clock" />Time</dt><dd>{startTime === null ? "Select a time" : `${formatHour(startTime)} – ${formatHour(startTime + duration)}`}</dd></div>
          <div><dt>Duration</dt><dd>{duration} {duration === 1 ? "hour" : "hours"}</dd></div>
          <div><dt>Facility</dt><dd>Assigned automatically</dd></div>
        </dl>
        <div className="summary-total"><span>Total</span><strong>${pricePerHour * duration}</strong></div>
        <p className="summary-note">The first available {sport.toLowerCase()} facility will be reserved for you.</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        {isAuthenticated ? (
          <button className="button button-full" disabled={startTime === null || isSubmitting || isLoading} onClick={createBooking}>{isSubmitting ? "Reserving…" : "Continue to payment"}</button>
        ) : (
          <Link className="button button-full" href="/login">Sign in to book</Link>
        )}
      </aside>
    </div>
  );
}
