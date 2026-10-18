// สร้างหมวดหมู่เริ่มต้น  รันด้วย: npm run db:seed
// ทำงานเฉพาะตอนที่ตาราง Category ยังว่างอยู่ (ถ้ามีหมวดอยู่แล้วจะไม่แตะอะไร)
import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const expense = [
  "อาหาร",
  "เครื่องดื่ม",
  "เดินทาง",
  "ที่พัก",
  "ค่าน้ำ ค่าไฟ ค่าเน็ต",
  "ช้อปปิ้ง",
  "บันเทิง",
  "สุขภาพ",
  "การศึกษา",
  "อื่นๆ",
];

const income = ["เงินเดือน", "โบนัส", "งานพิเศษ", "ลงทุน", "อื่นๆ"];

async function main() {
  const count = await prisma.category.count();

  if (count > 0) {
    console.log(`มีหมวดหมู่อยู่แล้ว ${count} รายการ ข้าม seed`);
    return;
  }

  await prisma.category.createMany({
    data: [
      ...expense.map((name) => ({ name, type: "EXPENSE" as const })),
      ...income.map((name) => ({ name, type: "INCOME" as const })),
    ],
  });

  console.log(`เพิ่มหมวดหมู่แล้ว ${expense.length + income.length} รายการ`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
