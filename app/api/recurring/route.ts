import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { initialLastRunYm } from "@/lib/recurring";

const MAX_RULES = 50;

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
      orderBy: [{ dayOfMonth: "asc" }, { createdAt: "asc" }],
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
    const { amount, type, description, dayOfMonth, categoryId } = body;

    const numericAmount = Number(amount);

    if (
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      numericAmount >= 10_000_000_000
    ) {
      return NextResponse.json(
        { error: "จำนวนเงินต้องเป็นตัวเลขที่มากกว่า 0" },
        { status: 400 }
      );
    }

    if (type !== "INCOME" && type !== "EXPENSE") {
      return NextResponse.json(
        { error: "ประเภทข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const day = Number(dayOfMonth);

    if (!Number.isInteger(day) || day < 1 || day > 31) {
      return NextResponse.json(
        { error: "วันที่ต้องอยู่ระหว่าง 1-31" },
        { status: 400 }
      );
    }

    if (!categoryId || typeof categoryId !== "string") {
      return NextResponse.json(
        { error: "กรุณาเลือกหมวดหมู่" },
        { status: 400 }
      );
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return NextResponse.json(
        { error: "รายละเอียดไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    if (typeof description === "string" && description.length > 200) {
      return NextResponse.json(
        { error: "รายละเอียดต้องไม่เกิน 200 ตัวอักษร" },
        { status: 400 }
      );
    }

    const [category, count] = await Promise.all([
      prisma.category.findFirst({ where: { id: categoryId, type } }),
      prisma.recurringTransaction.count({
        where: { userId: session.user.id },
      }),
    ]);

    if (!category) {
      return NextResponse.json(
        { error: "หมวดหมู่ไม่ถูกต้องหรือไม่ตรงกับประเภทรายการ" },
        { status: 400 }
      );
    }

    if (count >= MAX_RULES) {
      return NextResponse.json(
        { error: `สร้างรายการประจำได้สูงสุด ${MAX_RULES} รายการ` },
        { status: 400 }
      );
    }

    const rule = await prisma.recurringTransaction.create({
      data: {
        amount: numericAmount,
        type,
        description:
          typeof description === "string" ? description.trim() || null : null,
        dayOfMonth: day,
        lastRunYm: initialLastRunYm(day),
        userId: session.user.id,
        categoryId,
      },
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
