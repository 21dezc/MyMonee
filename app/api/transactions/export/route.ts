import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { formatYmd } from "@/lib/date";
import { buildWhere, parseFilters } from "@/lib/transactionFilters";

const MAX_ROWS = 20000;

// ป้องกัน CSV injection: ถ้าเซลล์ขึ้นต้นด้วยอักขระที่ Excel มองเป็นสูตร ให้ใส่ ' นำหน้า
function sanitize(value: string) {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function cell(value: string) {
  const text = sanitize(value);

  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// ดาวน์โหลดรายการเป็น CSV ตามตัวกรองเดียวกับหน้ารายการ
export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("กรุณาเข้าสู่ระบบก่อน", { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);

    const filters = parseFilters(Object.fromEntries(searchParams));

    const transactions = await prisma.transaction.findMany({
      where: buildWhere(session.user.id, filters),
      include: { category: true },
      orderBy: { date: "desc" },
      take: MAX_ROWS,
    });

    const lines = [
      ["วันที่", "ประเภท", "หมวดหมู่", "รายละเอียด", "จำนวนเงิน"]
        .map(cell)
        .join(","),
      ...transactions.map((transaction) =>
        [
          formatYmd(transaction.date),
          transaction.type === "INCOME" ? "รายรับ" : "รายจ่าย",
          transaction.category.name,
          transaction.description ?? "",
          Number(transaction.amount).toFixed(2),
        ]
          .map(cell)
          .join(",")
      ),
    ];

    // BOM ให้ Excel อ่านภาษาไทยได้ถูกต้อง
    const body = "\uFEFF" + lines.join("\r\n") + "\r\n";

    const fileName = `mymonee-${formatYmd(new Date()).replace(/-/g, "")}.csv`;

    return new Response(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(error);

    return new Response("ไม่สามารถส่งออกข้อมูลได้", { status: 500 });
  }
}
