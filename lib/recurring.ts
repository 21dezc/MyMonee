import prisma from "@/lib/prisma";
import { todayBangkok } from "@/lib/date";
import { advanceDate } from "@/lib/recurrence";

// ตามเก็บย้อนหลังได้สูงสุดกี่งวดต่อกฎต่อครั้ง (กันวนนานเกินไป ที่เหลือจะทำต่อรอบหน้า)
const MAX_CATCH_UP = 120;

// สร้างรายการจากรายการประจำที่ถึงกำหนดแล้ว (เรียกตอนเปิดหน้า dashboard / รายการ / รายการประจำ)
// ไม่ใช้ cron เพราะ Vercel Hobby ตั้งได้แค่วันละครั้ง
//
// - ถึงกำหนด = nextRunDate <= วันนี้ (เวลาไทย)
// - ใช้ updateMany ที่เช็ค nextRunDate เดิมเป็น "ตัวจองสิทธิ์" ใน transaction เดียวกับการสร้างรายการ
//   เปิดหลายแท็บพร้อมกันก็ไม่สร้างซ้ำ
// - ครบจำนวนงวด หรืองวดถัดไปเลยวันสิ้นสุด -> finished = true และ active = false
export async function processRecurring(userId: string) {
  try {
    const today = todayBangkok();

    const rules = await prisma.recurringTransaction.findMany({
      where: {
        userId,
        active: true,
        finished: false,
        nextRunDate: { lte: today },
      },
    });

    if (rules.length === 0) return 0;

    let created = 0;

    for (const rule of rules) {
      let current = rule.nextRunDate;
      let runCount = rule.runCount;

      for (let i = 0; i < MAX_CATCH_UP && current <= today; i++) {
        const claimFrom = current;
        const next = advanceDate(current, rule.startDate, rule.frequency);
        const newRunCount = runCount + 1;

        const done =
          (rule.installments !== null && newRunCount >= rule.installments) ||
          (rule.endDate !== null && next > rule.endDate);

        const ok = await prisma.$transaction(async (tx) => {
          const claimed = await tx.recurringTransaction.updateMany({
            where: {
              id: rule.id,
              active: true,
              finished: false,
              nextRunDate: claimFrom,
            },
            data: {
              nextRunDate: next,
              lastRunDate: claimFrom,
              runCount: newRunCount,
              ...(done ? { finished: true, active: false } : {}),
            },
          });

          if (claimed.count !== 1) return false;

          await tx.transaction.create({
            data: {
              amount: rule.amount,
              type: rule.type,
              description: rule.description,
              date: claimFrom,
              userId: rule.userId,
              categoryId: rule.categoryId,
              recurringId: rule.id,
            },
          });

          return true;
        });

        if (!ok) break;

        created++;
        runCount = newRunCount;
        current = next;

        if (done) break;
      }
    }

    return created;
  } catch (error) {
    // สร้างรายการประจำไม่สำเร็จไม่ควรทำให้หน้าเว็บพัง
    console.error("processRecurring error:", error);
    return 0;
  }
}
