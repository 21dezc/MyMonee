import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { todayBangkok } from "@/lib/date";
import { skipToDate } from "@/lib/recurrence";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// เปิด/ปิดการทำงานของรายการประจำ
export async function PATCH(request: Request, { params }: Params) {
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

    if (typeof body.active !== "boolean") {
      return NextResponse.json(
        { error: "ข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const rule = await prisma.recurringTransaction.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!rule) {
      return NextResponse.json(
        { error: "ไม่พบรายการประจำ" },
        { status: 404 }
      );
    }

    // รายการที่ครบงวด/ครบกำหนดแล้วเปิดใหม่ไม่ได้ (ให้สร้างใหม่แทน)
    if (rule.finished) {
      return NextResponse.json(
        { error: "รายการนี้ครบกำหนดแล้ว กรุณาสร้างรายการประจำใหม่" },
        { status: 400 }
      );
    }

    // ปิด -> เปิดใหม่: ข้ามงวดที่ผ่านไปตอนปิดอยู่ (ไม่สร้างย้อนหลัง) เริ่มที่งวดถัดไปที่ยังไม่ถึง
    if (body.active && !rule.active) {
      const next = skipToDate(
        rule.nextRunDate,
        rule.startDate,
        rule.frequency,
        todayBangkok()
      );

      if (rule.endDate !== null && next > rule.endDate) {
        await prisma.recurringTransaction.update({
          where: { id },
          data: { nextRunDate: next, finished: true, active: false },
        });

        return NextResponse.json(
          { error: "เลยวันสิ้นสุดแล้ว รายการนี้ครบกำหนด" },
          { status: 400 }
        );
      }

      await prisma.recurringTransaction.update({
        where: { id },
        data: { active: true, nextRunDate: next },
      });
    } else {
      await prisma.recurringTransaction.update({
        where: { id },
        data: { active: body.active },
      });
    }

    return NextResponse.json({ message: "อัปเดตสำเร็จ" });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "ไม่สามารถอัปเดตได้" },
      { status: 500 }
    );
  }
}

// ลบรายการประจำ (รายการที่สร้างไปแล้วจะไม่ถูกลบ)
export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อน" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const result = await prisma.recurringTransaction.deleteMany({
      where: { id, userId: session.user.id },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "ไม่พบรายการประจำ" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "ลบสำเร็จ" });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "ไม่สามารถลบได้" },
      { status: 500 }
    );
  }
}
