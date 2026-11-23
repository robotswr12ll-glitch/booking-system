import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = (await request.json()) as { status?: unknown };
  if (body.status !== "CANCELLED" && body.status !== "COMPLETED") {
    return NextResponse.json({ error: "Status must be CANCELLED or COMPLETED." }, { status: 400 });
  }

  try {
    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: { status: body.status },
      include: { facility: true, user: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Unable to update booking", error);
    return NextResponse.json({ error: "Booking not found or could not be updated." }, { status: 400 });
  }
}
