import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username =
      typeof body.username === "string"
        ? body.username.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    // ตรวจ Username และ Password
    if (!username || !password) {
      return NextResponse.json(
        { error: "กรุณากรอก Username และ Password" },
        { status: 400 }
      );
    }

    // ตรวจ Username
    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username ต้องมีอย่างน้อย 3 ตัวอักษร" },
        { status: 400 }
      );
    }

    if (username.length > 30) {
      return NextResponse.json(
        { error: "Username ต้องไม่เกิน 30 ตัวอักษร" },
        { status: 400 }
      );
    }

    // อนุญาตเฉพาะตัวอักษร ตัวเลข _ และ -
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username ใช้ได้เฉพาะตัวอักษร ตัวเลข _ และ -",
        },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z]/.test(username)) {
      return NextResponse.json(
        { error: "Username ต้องขึ้นต้นด้วยตัวอักษรภาษาอังกฤษ" },
        { status: 400 }
      );
    }

    // ตรวจ Password
    if (password.length < 6 || password.length > 100) {
      return NextResponse.json(
        { error: "Password ต้องมี 6–100 ตัวอักษร" },
        { status: 400 }
      );
    }

    if (!/^[\x21-\x7E]+$/.test(password)) {
      return NextResponse.json(
        { error: "รหัสผ่านต้องเป็นภาษาอังกฤษเท่านั้น" },
        { status: 400 }
      );
    }

    // Hash Password ก่อนบันทึก
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        message: "สมัครสมาชิกสำเร็จ",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" },
      { status: 500 }
    );
  }
}

