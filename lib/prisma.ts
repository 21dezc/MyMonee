import "dotenv/config";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// เก็บ client ไว้ใน globalThis เพื่อไม่ให้สร้าง connection ซ้ำตอน hot reload
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prisma ?? createClient();

globalForPrisma.prisma = prisma;

export default prisma;
