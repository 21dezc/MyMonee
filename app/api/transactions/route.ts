import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

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

    const transaction = await prisma.transaction.create({
      data: {
        amount: Number(amount),
        type,
        description: description || null,
        date: date ? new Date(date) : new Date(),
        userId: session.user.id,
        categoryId: categoryId,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "ไม่สามารถเพิ่มรายการได้" },
      { status: 500 }
    );
  }
}