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

    if (!month || !year) {
      return NextResponse.json(
        { error: "กรุณาระบุเดือนและปี" },
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

    if (!amount || !month || !year || !categoryId) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบ" },
        { status: 400 }
      );
    }

    if (Number(amount) <= 0) {
      return NextResponse.json(
        { error: "งบประมาณต้องมากกว่า 0" },
        { status: 400 }
      );
    }

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

    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId: session.user.id,
          categoryId,
          month: Number(month),
          year: Number(year),
        },
      },
      update: {
        amount: Number(amount),
      },
      create: {
        amount: Number(amount),
        month: Number(month),
        year: Number(year),
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