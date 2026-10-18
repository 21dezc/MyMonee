import prisma from "@/lib/prisma";
import {
  bangkokParts,
  daysInMonth,
  nextYm,
  parseYm,
  prevYm,
  ymKey,
} from "@/lib/date";

// เดือนล่าสุดที่ถือว่า "จัดการแล้ว" ตอนสร้าง/เปิดใช้รายการประจำ
// - ถ้าวันที่ตั้งไว้ยังไม่ผ่าน (หรือเป็นวันนี้) -> ให้สร้างรายการของเดือนนี้ด้วย
// - ถ้าวันที่ตั้งไว้ผ่านไปแล้ว -> เริ่มสร้างตั้งแต่เดือนหน้า (ไม่ย้อนหลัง)
export function initialLastRunYm(dayOfMonth: number) {
  const today = bangkokParts(new Date());
  const scheduledDay = Math.min(
    dayOfMonth,
    daysInMonth(today.year, today.month)
  );

  return scheduledDay >= today.day
    ? prevYm(today.year, today.month)
    : ymKey(today.year, today.month);
}

// สร้างรายการจากรายการประจำที่ถึงกำหนดแล้ว (เรียกตอนเปิดหน้า dashboard / รายการ)
// ไม่ใช้ cron เพราะ Vercel Hobby ตั้งได้จำกัด และวิธีนี้ทำงานเฉพาะตอนผู้ใช้เปิดแอป
export async function processRecurring(userId: string) {
  try {
    const rules = await prisma.recurringTransaction.findMany({
      where: { userId, active: true },
    });

    if (rules.length === 0) return 0;

    const today = bangkokParts(new Date());
    const currentYm = ymKey(today.year, today.month);

    let created = 0;

    for (const rule of rules) {
      let last = rule.lastRunYm;

      // กันวนนานเกินไปถ้าข้อมูลเก่ามาก
      for (let i = 0; i < 24 && last < currentYm; i++) {
        const ym = nextYm(last);
        const { year, month } = parseYm(ym);
        const day = Math.min(rule.dayOfMonth, daysInMonth(year, month));

        // เดือนนี้ แต่ยังไม่ถึงวันที่กำหนด
        if (ym === currentYm && day > today.day) break;

        const claimedFrom = last;

        const ok = await prisma.$transaction(async (tx) => {
          // จองรอบนี้ก่อน กันสร้างซ้ำถ้าเปิดหลายแท็บพร้อมกัน
          const claimed = await tx.recurringTransaction.updateMany({
            where: { id: rule.id, active: true, lastRunYm: claimedFrom },
            data: { lastRunYm: ym },
          });

          if (claimed.count !== 1) return false;

          await tx.transaction.create({
            data: {
              amount: rule.amount,
              type: rule.type,
              description: rule.description,
              // เก็บเป็น 00:00 UTC ของวันนั้น เหมือนที่ฟอร์มเพิ่มรายการทำ
              date: new Date(Date.UTC(year, month - 1, day)),
              userId: rule.userId,
              categoryId: rule.categoryId,
            },
          });

          return true;
        });

        if (!ok) break;

        last = ym;
        created++;
      }
    }

    return created;
  } catch (error) {
    // ถ้าพลาดไม่ควรทำให้ทั้งหน้าพัง
    console.error("processRecurring error:", error);
    return 0;
  }
}
