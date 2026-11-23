import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  CLOSING_HOUR,
  createBooking,
  getTodayDateString,
  NoAvailabilityError,
  OPENING_HOUR,
  parseBookingDate,
  SPORTS,
} from "@/lib/booking";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: { facility: true },
    orderBy: [{ date: "desc" }, { startTime: "desc" }],
  });

  return NextResponse.json({ bookings });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const { sport, date: dateValue, startTime, duration } = body;

    if (
      typeof sport !== "string" ||
      !SPORTS.includes(sport as (typeof SPORTS)[number]) ||
      typeof dateValue !== "string" ||
      !Number.isInteger(startTime) ||
      !Number.isInteger(duration) ||
      (duration as number) < 1 ||
      (duration as number) > 5 ||
      (startTime as number) < OPENING_HOUR ||
      (startTime as number) + (duration as number) > CLOSING_HOUR
    ) {
      return NextResponse.json({ error: "Choose a valid sport, time, and duration." }, { status: 400 });
    }

    const date = parseBookingDate(dateValue);
    if (!date || dateValue < getTodayDateString()) {
      return NextResponse.json({ error: "Choose today or a future date." }, { status: 400 });
    }

    if (dateValue === getTodayDateString()) {
      const currentHour = Number(
        new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Bangkok",
          hour: "2-digit",
          hourCycle: "h23",
        }).format(new Date()),
      );
      if ((startTime as number) <= currentHour) {
        return NextResponse.json({ error: "Choose a future start time." }, { status: 400 });
      }
    }

    const booking = await createBooking({
      userId: session.user.id,
      sport,
      date,
      startTime: startTime as number,
      duration: duration as number,
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof NoAvailabilityError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error("Unable to create booking", error);
    return NextResponse.json({ error: "Unable to create the booking." }, { status: 500 });
  }
}
