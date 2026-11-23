import { BookingStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parseBookingDate, SPORTS } from "@/lib/booking";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const params = new URL(request.url).searchParams;
  const where: Prisma.BookingWhereInput = {};
  const date = params.get("date");
  const sport = params.get("sport");
  const status = params.get("status");

  if (date) {
    const parsed = parseBookingDate(date);
    if (!parsed) return NextResponse.json({ error: "Invalid date." }, { status: 400 });
    where.date = parsed;
  }
  if (sport) {
    if (!SPORTS.includes(sport as (typeof SPORTS)[number])) {
      return NextResponse.json({ error: "Invalid sport." }, { status: 400 });
    }
    where.facility = { sport };
  }
  if (status) {
    if (!Object.values(BookingStatus).includes(status as BookingStatus)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    where.status = status as BookingStatus;
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: { facility: true, user: { select: { id: true, name: true, email: true } } },
    orderBy: [{ date: "desc" }, { startTime: "asc" }],
  });

  return NextResponse.json({ bookings });
}
