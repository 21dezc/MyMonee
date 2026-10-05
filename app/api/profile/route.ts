import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "ไม่ได้เข้าสู่ระบบ" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();

    // แก้ชื่อ
    if (name !== undefined) {
      if (!name) {
        return NextResponse.json(
          { error: "กรุณากรอกชื่อ" },
          { status: 400 }
        );
      }

      if (name.length < 2 || name.length > 30) {
        return NextResponse.json(
          { error: "ชื่อต้องมี 2-30 ตัวอักษร" },
          { status: 400 }
        );
      }

      const user = await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          name,
        },
      });

      return NextResponse.json({
        message: "แก้ไขชื่อสำเร็จ",
        user: {
          name: user.name,
        },
      });
    }

    // เพิ่ม/แก้อีเมล
    if (email !== undefined) {
      if (!email) {
        return NextResponse.json(
          { error: "กรุณากรอกอีเมล" },
          { status: 400 }
        );
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "รูปแบบอีเมลไม่ถูกต้อง" },
          { status: 400 }
        );
      }

      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: {
            id: session.user.id,
          },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "อีเมลนี้ถูกใช้งานแล้ว" },
          { status: 400 }
        );
      }

      const user = await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          email,
        },
      });

      return NextResponse.json({
        message: "แก้ไขอีเมลสำเร็จ",
        user: {
          email: user.email,
        },
      });
    }

    return NextResponse.json(
      { error: "ไม่มีข้อมูลที่ต้องแก้ไข" },
      { status: 400 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "ไม่สามารถแก้ไขข้อมูลได้" },
      { status: 500 }
    );
  }
}