import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AdminDashboard } from "@/components/admin-dashboard";
import { SiteHeader } from "@/components/site-header";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const bookings = await prisma.booking.findMany({
    include: {
      facility: { select: { name: true, sport: true, pricePerHour: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: [{ date: "desc" }, { startTime: "asc" }],
  });

  return (
    <>
      <SiteHeader />
      <main className="page-shell admin-shell">
        <div className="page-intro"><div><p className="overline">Club management</p><h1>Admin dashboard.</h1></div><p>Every reservation, across every court and field.</p></div>
        <AdminDashboard initialBookings={bookings.map((booking) => ({
          id: booking.id,
          date: booking.date.toISOString(),
          startTime: booking.startTime,
          duration: booking.duration,
          status: booking.status,
          facility: booking.facility,
          user: booking.user,
        }))} />
      </main>
    </>
  );
}
