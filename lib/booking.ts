import { BookingStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const SPORTS = ["Basketball", "Football", "Tennis", "Badminton", "Swimming"] as const;
export const OPENING_HOUR = 6;
export const CLOSING_HOUR = 22;
export const HOURS = Array.from(
  { length: CLOSING_HOUR - OPENING_HOUR },
  (_, index) => OPENING_HOUR + index,
);
export const ACTIVE_STATUSES = [BookingStatus.PENDING, BookingStatus.CONFIRMED];

export type FacilityWithAvailability = {
  id: string;
  name: string;
  sport: string;
  pricePerHour: number;
  availableHours: number[];
};

export function getTodayDateString() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function parseBookingDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

export function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function formatDate(date: Date | string) {
  const value = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export function formatHour(hour: number) {
  return `${hour}:00`;
}

export function formatTimeRange(startTime: number, duration: number) {
  return `${formatHour(startTime)} – ${formatHour(startTime + duration)}`;
}

export function getBookingEndTimestamp(booking: { date: Date | string; startTime: number; duration: number }) {
  const date = typeof booking.date === "string" ? new Date(booking.date) : booking.date;
  const utcEndHour = booking.startTime + booking.duration - 7;
  return date.getTime() + utcEndHour * 60 * 60 * 1000;
}

export function isBookingHistory(booking: {
  date: Date | string;
  startTime: number;
  duration: number;
  status: BookingStatus;
}) {
  return (
    booking.status === BookingStatus.CANCELLED ||
    booking.status === BookingStatus.COMPLETED ||
    getBookingEndTimestamp(booking) <= Date.now()
  );
}

export async function getFacilitiesWithAvailability(dateString: string): Promise<FacilityWithAvailability[]> {
  const date = parseBookingDate(dateString);
  if (!date) {
    throw new Error("Invalid booking date.");
  }

  const [facilities, bookings] = await Promise.all([
    prisma.facility.findMany({ orderBy: [{ sport: "asc" }, { name: "asc" }] }),
    prisma.booking.findMany({
      where: { date, status: { in: ACTIVE_STATUSES } },
      select: { facilityId: true, startTime: true, duration: true },
    }),
  ]);

  const currentHour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(new Date()),
  );

  return facilities.map((facility) => {
    const unavailableHours = new Set<number>();
    for (const booking of bookings) {
      if (booking.facilityId !== facility.id) continue;
      for (let hour = booking.startTime; hour < booking.startTime + booking.duration; hour += 1) {
        unavailableHours.add(hour);
      }
    }

    return {
      id: facility.id,
      name: facility.name,
      sport: facility.sport,
      pricePerHour: facility.pricePerHour,
      availableHours: HOURS.filter(
        (hour) =>
          !unavailableHours.has(hour) &&
          (dateString !== getTodayDateString() || hour > currentHour),
      ),
    };
  });
}

export class NoAvailabilityError extends Error {
  constructor() {
    super("No availability, try another time.");
    this.name = "NoAvailabilityError";
  }
}

export async function createBooking(input: {
  userId: string;
  sport: string;
  date: Date;
  startTime: number;
  duration: number;
}) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(
        async (transaction) => {
          const facilities = await transaction.facility.findMany({
            where: { sport: input.sport },
            orderBy: { name: "asc" },
          });

          if (facilities.length === 0) {
            throw new NoAvailabilityError();
          }

          const bookings = await transaction.booking.findMany({
            where: {
              facilityId: { in: facilities.map((facility) => facility.id) },
              date: input.date,
              status: { in: ACTIVE_STATUSES },
            },
          });

          const endTime = input.startTime + input.duration;
          const facility = facilities.find((candidate) =>
            bookings.every(
              (booking) =>
                booking.facilityId !== candidate.id ||
                input.startTime >= booking.startTime + booking.duration ||
                booking.startTime >= endTime,
            ),
          );

          if (!facility) {
            throw new NoAvailabilityError();
          }

          return transaction.booking.create({
            data: {
              userId: input.userId,
              facilityId: facility.id,
              date: input.date,
              startTime: input.startTime,
              duration: input.duration,
            },
            include: { facility: true },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      const canRetry =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034";
      if (!canRetry || attempt === 2) throw error;
    }
  }

  throw new NoAvailabilityError();
}
