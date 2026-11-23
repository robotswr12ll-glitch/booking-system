const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

const facilities = [
  ["basketball-court-a", "Basketball Court A", "Basketball", 25],
  ["basketball-court-b", "Basketball Court B", "Basketball", 25],
  ["football-field-1", "Football Field 1", "Football", 50],
  ["football-field-2", "Football Field 2", "Football", 50],
  ["tennis-court-a", "Tennis Court A", "Tennis", 30],
  ["tennis-court-b", "Tennis Court B", "Tennis", 30],
  ["badminton-court-a", "Badminton Court A", "Badminton", 10],
  ["badminton-court-b", "Badminton Court B", "Badminton", 10],
  ["swimming-pool-lane-1", "Swimming Pool Lane 1", "Swimming", 15],
  ["swimming-pool-lane-2", "Swimming Pool Lane 2", "Swimming", 15],
];

async function main() {
  for (const [id, name, sport, pricePerHour] of facilities) {
    await prisma.facility.upsert({
      where: { id },
      update: { name, sport, pricePerHour },
      create: { id, name, sport, pricePerHour },
    });
  }

  await prisma.user.upsert({
    where: { email: "admin@courtside.com" },
    update: { role: "ADMIN" },
    create: {
      email: "admin@courtside.com",
      name: "CourtSide Admin",
      passwordHash: await hash("admin123", 12),
      role: "ADMIN",
    },
  });

  console.log(`Seeded ${facilities.length} facilities and the CourtSide admin account.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
