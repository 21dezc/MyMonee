import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// ดูรายการเดียว
export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อน" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "ไม่พบรายการนี้" },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "ไม่สามารถดึงข้อมูลรายการได้" },
      { status: 500 }
    );
  }
}

// แก้ไขรายการ
export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อน" },
        { status: 401 }
      );
    }

    const { id } = await params;
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

    // ตรวจ categoryId
    if (!categoryId || typeof categoryId !== "string") {
      return NextResponse.json(
        { error: "กรุณาเลือกหมวดหมู่" },
        { status: 400 }
      );
    }

    // ตรวจว่ารายการนี้เป็นของ user คนปัจจุบันจริง
    const existingTransaction =
      await prisma.transaction.findFirst({
        where: {
          id,
          userId: session.user.id,
        },
      });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "ไม่พบรายการนี้" },
        { status: 404 }
      );
    }

    // ตรวจ category ว่ามีอยู่จริง
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

    if (
      typeof description === "string" &&
      description.length > 200
    ) {
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

    // อัปเดตรายการ
    const transaction =
      await prisma.transaction.update({
        where: {
          id,
        },
        data: {
          amount: numericAmount,
          type,
          description:
            typeof description === "string"
              ? description.trim() || null
              : null,
          date: transactionDate,
          categoryId,
        },
      });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "ไม่สามารถแก้ไขรายการได้" },
      { status: 500 }
    );
  }
}

// ลบรายการ
export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อน" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existingTransaction =
      await prisma.transaction.findFirst({
        where: {
          id,
          userId: session.user.id,
        },
      });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "ไม่พบรายการนี้" },
        { status: 404 }
      );
    }

    await prisma.transaction.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "ลบรายการสำเร็จ",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "ไม่สามารถลบรายการได้" },
      { status: 500 }
    );
  }
}