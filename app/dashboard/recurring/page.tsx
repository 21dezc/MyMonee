import { getSession } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import RecurringForm from "./RecurringForm";
import RecurringActions from "./RecurringActions";

export default async function RecurringPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [rules, categories] = await Promise.all([
    prisma.recurringTransaction.findMany({
      where: { userId: session.user.id },
      include: { category: true },
      orderBy: [{ dayOfMonth: "asc" }, { createdAt: "asc" }],
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const money = (value: number) =>
    value.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <main className="pb-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold">รายการประจำ</h1>

        <p className="mt-1 text-xs text-muted">
          รายการที่เกิดซ้ำทุกเดือน เช่น ค่าเช่า ค่าอินเทอร์เน็ต เงินเดือน
          ระบบจะสร้างรายการให้ตามวันที่กำหนดเมื่อคุณเปิดแอป
        </p>

        <section className="card mt-8 p-6">
          <h2 className="text-lg font-semibold">เพิ่มรายการประจำ</h2>

          <RecurringForm categories={categories} />
        </section>

        <section className="mt-10 px-1">
          <h2 className="text-lg font-semibold">
            รายการประจำของคุณ ({rules.length})
          </h2>

          <div className="mt-3">
            {rules.length === 0 ? (
              <p className="py-8 text-center text-faint">
                ยังไม่มีรายการประจำ
              </p>
            ) : (
              rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`flex flex-wrap items-center justify-between gap-3 border-b border-line py-4 last:border-b-0 ${
                    rule.active ? "" : "opacity-50"
                  }`}
                >
                  <div>
                    <p className="text-sm">
                      {rule.description || rule.category.name}
                    </p>

                    <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-faint">
                      <span>{rule.category.name}</span>
                      <span>•</span>
                      <span>ทุกวันที่ {rule.dayOfMonth}</span>
                      {!rule.active && (
                        <>
                          <span>•</span>
                          <span>ปิดอยู่</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <p
                      className={`text-sm font-medium ${
                        rule.type === "INCOME"
                          ? "text-income"
                          : "text-expense"
                      }`}
                    >
                      {rule.type === "INCOME" ? "+" : "-"}฿
                      {money(Number(rule.amount))}
                    </p>

                    <RecurringActions id={rule.id} active={rule.active} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
