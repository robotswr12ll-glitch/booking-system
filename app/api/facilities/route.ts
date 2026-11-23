import { NextResponse } from "next/server";
import { getFacilitiesWithAvailability, getTodayDateString, parseBookingDate } from "@/lib/booking";

export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date") ?? getTodayDateString();

  if (!parseBookingDate(date)) {
    return NextResponse.json({ error: "Use a date in YYYY-MM-DD format." }, { status: 400 });
  }

  try {
    const facilities = await getFacilitiesWithAvailability(date);
    return NextResponse.json({ facilities, date });
  } catch (error) {
    console.error("Unable to load facilities", error);
    return NextResponse.json({ error: "Unable to load availability." }, { status: 500 });
  }
}
