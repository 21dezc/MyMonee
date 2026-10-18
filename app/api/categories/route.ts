import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    // หมวดหมู่เปลี่ยนไม่บ่อย ให้ cache สั้นๆ ลดการยิง DB
    return NextResponse.json(categories, {
      headers: {
        "Cache-Control":
          "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "ไม่สามารถดึงหมวดหมู่ได้" },
      { status: 500 }
    );
  }
}