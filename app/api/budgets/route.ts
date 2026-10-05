import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// ดูงบประมาณ
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

    const month = Number(searchParams.get("month"));
    const year = Number(searchParams.get("year"));

    // ตรวจเดือน
    if (
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12
    ) {
      return NextResponse.json(
        { error: "เดือนต้องอยู่ระหว่าง 1 ถึง 12" },
        { status: 400 }
      );
    }

    // ตรวจปี
    if (
      !Number.isInteger(year) ||
      year < 2000 ||
      year > 2100
    ) {
      return NextResponse.json(
        { error: "ปีไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.user.id,
        month,
        year,
      },
      include: {
        category: true,
      },
      orderBy: {
        category: {
          name: "asc",
        },
      },
    });

    return NextResponse.json(budgets);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "ไม่สามารถดึงข้อมูลงบประมาณได้" },
      { status: 500 }
    );
  }
}

// เพิ่ม / แก้ไขงบประมาณ
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
      month,
      year,
      categoryId,
    } = body;

    const numericAmount = Number(amount);
    const numericMonth = Number(month);
    const numericYear = Number(year);

    // ตรวจจำนวนเงิน
    if (
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return NextResponse.json(
        { error: "งบประมาณต้องเป็นตัวเลขที่มากกว่า 0" },
        { status: 400 }
      );
    }

    // ตรวจเดือน
    if (
      !Number.isInteger(numericMonth) ||
      numericMonth < 1 ||
      numericMonth > 12
    ) {
      return NextResponse.json(
        { error: "เดือนต้องอยู่ระหว่าง 1 ถึง 12" },
        { status: 400 }
      );
    }

    // ตรวจปี
    if (
      !Number.isInteger(numericYear) ||
      numericYear < 2000 ||
      numericYear > 2100
    ) {
      return NextResponse.json(
        { error: "ปีไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // ตรวจ categoryId
    if (
      !categoryId ||
      typeof categoryId !== "string"
    ) {
      return NextResponse.json(
        { error: "กรุณาเลือกหมวดหมู่รายจ่าย" },
        { status: 400 }
      );
    }

    // ตรวจหมวดหมู่
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        type: "EXPENSE",
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "ไม่พบหมวดหมู่รายจ่าย" },
        { status: 404 }
      );
    }

    // เพิ่ม / แก้ไขงบประมาณ
    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId: session.user.id,
          categoryId,
          month: numericMonth,
          year: numericYear,
        },
      },
      update: {
        amount: numericAmount,
      },
      create: {
        amount: numericAmount,
        month: numericMonth,
        year: numericYear,
        userId: session.user.id,
        categoryId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(budget, {
      status: 201,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "ไม่สามารถบันทึกงบประมาณได้" },
      { status: 500 }
    );
  }
}