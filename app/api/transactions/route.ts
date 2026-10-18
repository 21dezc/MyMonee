import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { monthRange } from "@/lib/date";

// ดูรายการของผู้ใช้ (ใส่ ?year=2026&month=10 เพื่อดึงเฉพาะเดือนนั้น)
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อน" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const year = Number(searchParams.get("year"));
    const month = Number(searchParams.get("month"));

    const hasMonth =
      Number.isInteger(year) &&
      Number.isInteger(month) &&
      year >= 2000 &&
      year <= 2100 &&
      month >= 1 &&
      month <= 12;

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        ...(hasMonth
          ? (() => {
              const { start, end } = monthRange(year, month);

              return { date: { gte: start, lt: end } };
            })()
          : {}),
      },
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "ไม่สามารถดึงรายการได้" },
      { status: 500 }
    );
  }
}

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
      date,
      categoryId,
    } = body;

    // ตรวจจำนวนเงิน
    const numericAmount = Number(amount);

    if (
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return NextResponse.json(
        { error: "จำนวนเงินต้องเป็นตัวเลขที่มากกว่า 0" },
        { status: 400 }
      );
    }

    // ตรวจประเภท
    if (type !== "INCOME" && type !== "EXPENSE") {
      return NextResponse.json(
        { error: "ประเภทข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // ตรวจหมวดหมู่
    if (!categoryId || typeof categoryId !== "string") {
      return NextResponse.json(
        { error: "กรุณาเลือกหมวดหมู่" },
        { status: 400 }
      );
    }

    // ตรวจว่าหมวดหมู่มีอยู่จริง
    // และต้องตรงกับประเภทของรายการ
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        type,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "หมวดหมู่ไม่ถูกต้องหรือไม่ตรงกับประเภทรายการ" },
        { status: 400 }
      );
    }

    // ตรวจรายละเอียด
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

    // ตรวจวันที่
    let transactionDate = new Date();

    if (date) {
      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: "วันที่ไม่ถูกต้อง" },
          { status: 400 }
        );
      }

      transactionDate = parsedDate;
    }

    // สร้างรายการ
    const transaction = await prisma.transaction.create({
      data: {
        amount: numericAmount,
        type,
        description:
          typeof description === "string"
            ? description.trim() || null
            : null,
        date: transactionDate,
        userId: session.user.id,
        categoryId,
      },
    });

    return NextResponse.json(transaction, {
      status: 201,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "ไม่สามารถเพิ่มรายการได้" },
      { status: 500 }
    );
  }
}