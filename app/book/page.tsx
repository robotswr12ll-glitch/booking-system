import { getServerSession } from "next-auth";
import { BookingExperience } from "@/components/booking-experience";
import { SiteHeader } from "@/components/site-header";
import { authOptions } from "@/lib/auth";
import { getFacilitiesWithAvailability, getTodayDateString } from "@/lib/booking";

export default async function BookPage() {
  const [session, date] = await Promise.all([getServerSession(authOptions), Promise.resolve(getTodayDateString())]);
  const facilities = await getFacilitiesWithAvailability(date);

  return (
    <>
      <SiteHeader />
      <main className="page-shell">
        <div className="page-intro"><div><p className="overline">Reserve your space</p><h1>Make time for your game.</h1></div><p>Choose a sport, find your time, and we’ll assign the best available facility.</p></div>
        <BookingExperience initialFacilities={facilities} initialDate={date} isAuthenticated={Boolean(session)} />
      </main>
    </>
  );
}
