import prisma from "@/lib/prisma";
import { TransactionType } from "@/app/generated/prisma/client";

async function main() {
  const categories = [
  { name: "เงินเดือน", type: TransactionType.INCOME },
  { name: "เงินพิเศษ", type: TransactionType.INCOME },
  { name: "ค่าอาหาร", type: TransactionType.EXPENSE },
  { name: "ค่าเดินทาง", type: TransactionType.EXPENSE },
  { name: "ช้อปปิ้ง", type: TransactionType.EXPENSE },
  { name: "บิลและค่าใช้จ่าย", type: TransactionType.EXPENSE },
  { name: "ความบันเทิง", type: TransactionType.EXPENSE },
  { name: "อื่นๆ", type: TransactionType.EXPENSE },
];

  for (const category of categories) {
    const existing = await prisma.category.findFirst({
      where: {
        name: category.name,
        type: category.type,
      },
    });

    if (!existing) {
      await prisma.category.create({
        data: category,
      });
    }
  }

  console.log("เพิ่มหมวดหมู่เรียบร้อยแล้ว");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });