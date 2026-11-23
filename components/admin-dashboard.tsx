"use client";

import { BookingStatus } from "@prisma/client";
import { useMemo, useState } from "react";
import { formatDate, formatTimeRange, isBookingHistory, SPORTS } from "@/lib/booking";

export type AdminBooking = {
  id: string;
  date: string;
  startTime: number;
  duration: number;
  status: BookingStatus;
  facility: { name: string; sport: string; pricePerHour: number };
  user: { name: string | null; email: string };
};

export function AdminDashboard({ initialBookings }: { initialBookings: AdminBooking[] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [date, setDate] = useState("");
  const [sport, setSport] = useState("");
  const [status, setStatus] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  const filtered = useMemo(() => bookings.filter((booking) =>
    (!date || booking.date.slice(0, 10) === date) &&
    (!sport || booking.facility.sport === sport) &&
    (!status || booking.status === status),
  ), [bookings, date, sport, status]);
  const upcoming = filtered.filter((booking) => !isBookingHistory(booking));
  const history = filtered.filter(isBookingHistory);

  async function updateStatus(id: string, nextStatus: "CANCELLED" | "COMPLETED") {
    setUpdatingId(id);
    setError("");
    const response = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    const data = (await response.json()) as { booking?: AdminBooking; error?: string };
    if (!response.ok || !data.booking) {
      setError(data.error ?? "Unable to update booking.");
    } else {
      setBookings((current) => current.map((booking) => booking.id === id ? data.booking! : booking));
    }
    setUpdatingId("");
  }

  function BookingTable({ items, empty }: { items: AdminBooking[]; empty: string }) {
    if (items.length === 0) return <p className="empty-state">{empty}</p>;
    return (
      <div className="table-wrap">
        <table className="booking-table">
          <thead><tr><th>User</th><th>Facility</th><th>Date</th><th>Time</th><th>Duration</th><th>Price</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>{items.map((booking) => (
            <tr key={booking.id}>
              <td><strong>{booking.user.name || "Member"}</strong><span>{booking.user.email}</span></td>
              <td><strong>{booking.facility.name}</strong><span>{booking.facility.sport}</span></td>
              <td>{formatDate(booking.date)}</td>
              <td>{formatTimeRange(booking.startTime, booking.duration)}</td>
              <td>{booking.duration}h</td>
              <td>${booking.duration * booking.facility.pricePerHour}</td>
              <td><span className={`status status-${booking.status.toLowerCase()}`}>{booking.status}</span></td>
              <td className="table-actions">{!isBookingHistory(booking) && <><button className="text-button" disabled={updatingId === booking.id} onClick={() => updateStatus(booking.id, "COMPLETED")}>Complete</button><button className="text-button muted-action" disabled={updatingId === booking.id} onClick={() => updateStatus(booking.id, "CANCELLED")}>Cancel</button></>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      <div className="admin-stats"><div><span>All reservations</span><strong>{bookings.length}</strong></div><div><span>Currently active</span><strong>{bookings.filter((booking) => !isBookingHistory(booking)).length}</strong></div><div><span>Sports</span><strong>{SPORTS.length}</strong></div></div>
      <div className="admin-filters">
        <label>Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        <label>Sport<select value={sport} onChange={(event) => setSport(event.target.value)}><option value="">All sports</option>{SPORTS.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{Object.values(BookingStatus).map((item) => <option key={item}>{item}</option>)}</select></label>
        {(date || sport || status) && <button className="text-button filter-reset" onClick={() => { setDate(""); setSport(""); setStatus(""); }}>Clear filters</button>}
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <section className="bookings-section"><div className="section-heading"><h2>Upcoming</h2><span>{upcoming.length}</span></div><BookingTable items={upcoming} empty="No bookings match these filters." /></section>
      <section className="bookings-section"><div className="section-heading"><h2>History</h2><span>{history.length}</span></div><BookingTable items={history} empty="No booking history matches these filters." /></section>
    </>
  );
}
