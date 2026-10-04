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

    if (!amount || !type || !categoryId) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบ" },
        { status: 400 }
      );
    }

    if (type !== "INCOME" && type !== "EXPENSE") {
      return NextResponse.json(
        { error: "ประเภทข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

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

    const transaction =
      await prisma.transaction.update({
        where: {
          id,
        },
        data: {
          amount: Number(amount),
          type,
          description: description || null,
          date: date ? new Date(date) : new Date(),
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