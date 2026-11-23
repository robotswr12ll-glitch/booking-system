import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isBookingHistory } from "@/lib/booking";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { facility: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (booking.userId !== session.user.id) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }
  if (booking.status !== "PENDING" || isBookingHistory(booking)) {
    return NextResponse.json({ error: "This booking cannot be paid." }, { status: 400 });
  }

  const confirmed = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "CONFIRMED" },
    include: { facility: true },
  });

  return NextResponse.json({ booking: confirmed });
}
