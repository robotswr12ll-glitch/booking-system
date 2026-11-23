import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Icon } from "@/components/icons";
import { PaymentForm } from "@/components/payment-form";
import { SiteHeader } from "@/components/site-header";
import { authOptions } from "@/lib/auth";
import { formatDate, formatTimeRange } from "@/lib/booking";
import { prisma } from "@/lib/prisma";

export default async function BookingConfirmationPage({ searchParams }: { searchParams: { id?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!searchParams.id) notFound();

  const booking = await prisma.booking.findUnique({
    where: { id: searchParams.id },
    include: { facility: true },
  });
  if (!booking) notFound();
  if (booking.userId !== session.user.id && session.user.role !== "ADMIN") redirect("/");

  const confirmed = booking.status === "CONFIRMED";
  const total = booking.duration * booking.facility.pricePerHour;

  return (
    <>
      <SiteHeader />
      <main className="confirmation-shell">
        <section className="confirmation-details">
          {confirmed ? <span className="confirmation-icon"><Icon name="Check" width={32} height={32} /></span> : <p className="overline">Your court is waiting</p>}
          <h1>{confirmed ? "Booking Confirmed" : "One last step."}</h1>
          <p className="confirmation-lead">{confirmed ? "Your time is yours. We look forward to seeing you on the court." : "Complete the demo payment to confirm your reservation."}</p>
          <div className="confirmation-card">
            <div><span>Facility</span><strong>{booking.facility.name}</strong></div>
            <div><span>Date</span><strong>{formatDate(booking.date)}</strong></div>
            <div><span>Time</span><strong>{formatTimeRange(booking.startTime, booking.duration)}</strong></div>
            <div><span>Duration</span><strong>{booking.duration} {booking.duration === 1 ? "hour" : "hours"}</strong></div>
            <div className="confirmation-total"><span>Total</span><strong>${total}</strong></div>
          </div>
          {confirmed && <div className="confirmation-actions"><Link className="button" href="/my-bookings">View my bookings</Link><Link className="button button-outline" href="/book">Book another</Link></div>}
          {booking.status === "CANCELLED" && <p className="status-message">This booking has been cancelled.</p>}
        </section>
        {booking.status === "PENDING" && <PaymentForm bookingId={booking.id} />}
      </main>
    </>
  );
}
