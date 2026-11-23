import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { CancelBookingButton } from "@/components/cancel-booking-button";
import { SiteHeader } from "@/components/site-header";
import { authOptions } from "@/lib/auth";
import { formatDate, formatTimeRange, isBookingHistory } from "@/lib/booking";
import { prisma } from "@/lib/prisma";

export default async function MyBookingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: { facility: true },
    orderBy: [{ date: "desc" }, { startTime: "asc" }],
  });
  const upcoming = bookings.filter((booking) => !isBookingHistory(booking));
  const history = bookings.filter(isBookingHistory);

  function BookingList({ items, empty }: { items: typeof bookings; empty: string }) {
    if (items.length === 0) return <p className="empty-state">{empty}</p>;
    return <div className="booking-list">{items.map((booking) => {
      const historical = isBookingHistory(booking);
      return (
        <article className="booking-row" key={booking.id}>
          <div className="booking-date"><span>{new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short" }).format(booking.date)}</span><strong>{booking.date.getUTCDate()}</strong></div>
          <div className="booking-primary"><span className={`status status-${booking.status.toLowerCase()}`}>{booking.status}</span><h2>{booking.facility.name}</h2><p>{booking.facility.sport}</p></div>
          <div className="booking-meta"><span>{formatDate(booking.date)}</span><strong>{formatTimeRange(booking.startTime, booking.duration)}</strong><span>{booking.duration} {booking.duration === 1 ? "hour" : "hours"}</span></div>
          <div className="booking-price"><strong>${booking.duration * booking.facility.pricePerHour}</strong><span>Total</span></div>
          {!historical && booking.status !== "CANCELLED" && <CancelBookingButton id={booking.id} />}
          {booking.status === "PENDING" && <Link className="text-button" href={`/booking/confirm?id=${booking.id}`}>Complete payment</Link>}
        </article>
      );
    })}</div>;
  }

  return (
    <>
      <SiteHeader />
      <main className="page-shell narrow-shell">
        <div className="page-intro"><div><p className="overline">Your schedule</p><h1>My bookings.</h1></div><Link className="button" href="/book">Book a court</Link></div>
        <section className="bookings-section"><div className="section-heading"><h2>Upcoming</h2><span>{upcoming.length}</span></div><BookingList items={upcoming} empty="No upcoming bookings. Your next game starts at the booking page." /></section>
        <section className="bookings-section"><div className="section-heading"><h2>History</h2><span>{history.length}</span></div><BookingList items={history} empty="Completed and cancelled bookings will appear here." /></section>
      </main>
    </>
  );
}
