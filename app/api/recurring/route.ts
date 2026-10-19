import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { parseYmd, todayBangkok } from "@/lib/date";

const MAX_RULES = 50;
const MAX_INSTALLMENTS = 360;
const FREQUENCIES = ["WEEKLY", "MONTHLY", "YEARLY"] as const;

function bad(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

// ดูรายการประจำทั้งหมดของผู้ใช้
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อน" },
        { status: 401 }
      );
    }

    const rules = await prisma.recurringTransaction.findMany({
      where: { userId: session.user.id },
      include: { category: true },
      orderBy: [{ nextRunDate: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "ไม่สามารถดึงรายการประจำได้" },
      { status: 500 }
    );
  }
}

// เพิ่มรายการประจำ
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อน" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      amount,
      type,
      description,
      frequency,
      startDate,
      endDate,
      installments,
      categoryId,
      fromTransactionId,
    } = body;

    const numericAmount = Number(amount);

    if (
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      numericAmount >= 10_000_000_000
    ) {
      return bad("จำนวนเงินต้องเป็นตัวเลขที่มากกว่า 0");
    }

    if (type !== "INCOME" && type !== "EXPENSE") {
      return bad("ประเภทต้องเป็นรายรับหรือรายจ่าย");
    }

    const freq = frequency ?? "MONTHLY";

    if (!FREQUENCIES.includes(freq)) {
      return bad("ความถี่ไม่ถูกต้อง");
    }

    const start = parseYmd(startDate);

    if (!start) {
      return bad("กรุณาเลือกวันเริ่ม");
    }

    if (start < todayBangkok()) {
      return bad("วันเริ่มต้องเป็นวันนี้หรืออนาคต");
    }

    const hasEnd = endDate !== undefined && endDate !== null && endDate !== "";
    const hasInstallments =
      installments !== undefined && installments !== null && installments !== "";

    if (hasEnd && hasInstallments) {
      return bad("กำหนดสิ้นสุดได้อย่างเดียว: จำนวนงวด หรือ วันสิ้นสุด");
    }

    let end: Date | null = null;
    let count: number | null = null;

    if (hasEnd) {
      end = parseYmd(endDate);

      if (!end) return bad("วันสิ้นสุดไม่ถูกต้อง");
      if (end < start) return bad("วันสิ้นสุดต้องไม่ก่อนวันเริ่ม");
    }

    if (hasInstallments) {
      count = Number(installments);

      if (!Number.isInteger(count) || count < 1 || count > MAX_INSTALLMENTS) {
        return bad(`จำนวนงวดต้องเป็นจำนวนเต็ม 1-${MAX_INSTALLMENTS}`);
      }
    }

    if (!categoryId || typeof categoryId !== "string") {
      return bad("กรุณาเลือกหมวดหมู่");
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return bad("รายละเอียดไม่ถูกต้อง");
    }

    if (typeof description === "string" && description.length > 200) {
      return bad("รายละเอียดต้องไม่เกิน 200 ตัวอักษร");
    }

    const [category, ruleCount] = await Promise.all([
      prisma.category.findFirst({ where: { id: categoryId, type } }),
      prisma.recurringTransaction.count({
        where: { userId: session.user.id },
      }),
    ]);

    if (!category) {
      return bad("หมวดหมู่ไม่ถูกต้องหรือไม่ตรงกับประเภท");
    }

    if (ruleCount >= MAX_RULES) {
      return bad(`สร้างรายการประจำได้สูงสุด ${MAX_RULES} รายการ`);
    }

    const rule = await prisma.$transaction(async (tx) => {
      const created = await tx.recurringTransaction.create({
        data: {
          amount: numericAmount,
          type,
          description:
            typeof description === "string" ? description.trim() || null : null,
          frequency: freq,
          startDate: start,
          nextRunDate: start,
          endDate: end,
          installments: count,
          userId: session.user.id,
          categoryId,
        },
      });

      // ปักหมุดจากรายการเดิม: ผูกรายการต้นทางให้ขึ้นป้าย "ประจำ" (เฉพาะรายการของตัวเองที่ยังไม่ผูก)
      if (typeof fromTransactionId === "string" && fromTransactionId) {
        await tx.transaction.updateMany({
          where: {
            id: fromTransactionId,
            userId: session.user.id,
            recurringId: null,
          },
          data: { recurringId: created.id },
        });
      }

      return created;
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "ไม่สามารถเพิ่มรายการประจำได้" },
      { status: 500 }
    );
  }
}
