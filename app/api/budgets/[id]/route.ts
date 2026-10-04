import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// ลบงบประมาณ
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

    const budget = await prisma.budget.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!budget) {
      return NextResponse.json(
        { error: "ไม่พบงบประมาณนี้" },
        { status: 404 }
      );
    }

    await prisma.budget.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "ลบงบประมาณสำเร็จ",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "ไม่สามารถลบงบประมาณได้" },
      { status: 500 }
    );
  }
}