import Link from "next/link";
import { getSession } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { processRecurring } from "@/lib/recurring";
import { bangkokDateOnly, formatYmd, todayBangkok } from "@/lib/date";
import {
  formatThaiDate,
  frequencyLabel,
  monthlyEquivalent,
  relativeDays,
  suggestStartDate,
} from "@/lib/recurrence";
import RecurringForm, { type RecurringInitial } from "./RecurringForm";
import RecurringActions from "./RecurringActions";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RecurringPage({ searchParams }: PageProps) {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const params = await searchParams;
  const fromParam = Array.isArray(params.from) ? params.from[0] : params.from;

  // สร้างรายการที่ถึงกำหนดก่อน เพื่อให้สถานะ "ครั้งถัดไป / สร้างล่าสุด" เป็นปัจจุบัน
  await processRecurring(userId);

  const today = todayBangkok();

  const [rules, categories, sourceTransaction] = await Promise.all([
    prisma.recurringTransaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    // ปักหมุดจากรายการที่มีอยู่แล้ว (?from=<id>)
    fromParam
      ? prisma.transaction.findFirst({
          where: { id: fromParam, userId, recurringId: null },
        })
      : Promise.resolve(null),
  ]);

  const initial: RecurringInitial | undefined = sourceTransaction
    ? {
        type: sourceTransaction.type,
        categoryId: sourceTransaction.categoryId,
        amount: sourceTransaction.amount.toString(),
        description: sourceTransaction.description ?? "",
        startDate: formatYmd(
          suggestStartDate(
            bangkokDateOnly(sourceTransaction.date),
            "MONTHLY",
            today
          )
        ),
        fromTransactionId: sourceTransaction.id,
      }
    : undefined;

  // เรียง: กำลังทำงาน (ใกล้ถึงก่อน) -> ปิดใช้งาน -> ครบกำหนดแล้ว
  const rank = (rule: (typeof rules)[number]) =>
    rule.finished ? 2 : rule.active ? 0 : 1;

  const sorted = [...rules].sort(
    (a, b) =>
      rank(a) - rank(b) || a.nextRunDate.getTime() - b.nextRunDate.getTime()
  );

  const running = rules.filter((rule) => rule.active && !rule.finished);

  const monthly = (type: "INCOME" | "EXPENSE") =>
    running
      .filter((rule) => rule.type === type)
      .reduce(
        (sum, rule) =>
          sum + monthlyEquivalent(Number(rule.amount), rule.frequency),
        0
      );

  const monthlyIncome = monthly("INCOME");
  const monthlyExpense = monthly("EXPENSE");

  const money = (value: number) =>
    value.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <main className="pb-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard"
          className="text-sm text-muted hover:text-ink"
        >
          ← กลับแดชบอร์ด
        </Link>

        <h1 className="mt-3 text-2xl font-semibold">รายการประจำ</h1>

        <p className="mt-1 text-xs text-muted">
          รายการที่เกิดซ้ำ เช่น ค่าเช่า ค่าอินเทอร์เน็ต เงินเดือน ค่าผ่อน
          ระบบจะสร้างรายการให้ตามวันที่กำหนดเมื่อคุณเปิดแอป
          และจะขึ้นป้าย 📌 ประจำ ที่หน้ารายการ
        </p>

        {/* สรุปต่อเดือน */}
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-line p-4">
            <p className="text-xs text-muted">รายรับประจำ / เดือน</p>
            <p className="mt-1 text-lg font-semibold text-income">
              ฿{money(monthlyIncome)}
            </p>
          </div>

          <div className="rounded-2xl bg-line p-4">
            <p className="text-xs text-muted">รายจ่ายประจำ / เดือน</p>
            <p className="mt-1 text-lg font-semibold text-expense">
              ฿{money(monthlyExpense)}
            </p>
          </div>

          <div className="rounded-2xl bg-line p-4">
            <p className="text-xs text-muted">คงเหลือจากรายการประจำ</p>
            <p className="mt-1 text-lg font-semibold">
              ฿{money(monthlyIncome - monthlyExpense)}
            </p>
          </div>
        </div>

        <p className="mt-2 text-xs text-faint">
          นับเฉพาะรายการที่เปิดใช้งานอยู่ ({running.length} รายการ) ·
          รายสัปดาห์เฉลี่ย ×52÷12 · รายปีเฉลี่ย ÷12
        </p>

        <section className="card mt-8 p-6">
          <h2 className="text-lg font-semibold">
            {initial ? "ตั้งเป็นรายการประจำ" : "เพิ่มรายการประจำ"}
          </h2>

          {initial && (
            <p className="mt-1 text-xs text-muted">
              ดึงข้อมูลจากรายการที่คุณเลือกมาให้แล้ว
              วันเริ่มคืองวดถัดไปเพื่อไม่ให้ซ้ำกับรายการเดิม
            </p>
          )}

          <RecurringForm
            key={initial?.fromTransactionId ?? "new"}
            categories={categories}
            today={formatYmd(today)}
            initial={initial}
          />
        </section>

        <section className="mt-10 px-1">
          <h2 className="text-lg font-semibold">
            รายการประจำของคุณ ({rules.length})
          </h2>

          <div className="mt-3">
            {sorted.length === 0 ? (
              <p className="py-8 text-center text-faint">
                ยังไม่มีรายการประจำ
              </p>
            ) : (
              sorted.map((rule) => {
                const dim = !rule.active;

                return (
                  <div
                    key={rule.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-4 last:border-b-0"
                  >
                    <div className={dim ? "opacity-60" : ""}>
                      <p className="flex flex-wrap items-center gap-2 text-sm">
                        {rule.description || rule.category.name}

                        {rule.finished && (
                          <span className="rounded-full bg-line px-2 py-0.5 text-xs text-muted">
                            ครบกำหนดแล้ว
                          </span>
                        )}

                        {!rule.finished && !rule.active && (
                          <span className="rounded-full bg-warn/10 px-2 py-0.5 text-xs text-warn">
                            ปิดใช้งานอยู่
                          </span>
                        )}
                      </p>

                      <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-faint">
                        <span>{rule.category.name}</span>
                        <span>•</span>
                        <span>
                          {frequencyLabel(rule.frequency, rule.startDate)}
                        </span>

                        {rule.installments !== null ? (
                          <>
                            <span>•</span>
                            <span>
                              งวดที่ {rule.runCount}/{rule.installments}
                            </span>
                          </>
                        ) : (
                          rule.runCount > 0 && (
                            <>
                              <span>•</span>
                              <span>สร้างแล้ว {rule.runCount} ครั้ง</span>
                            </>
                          )
                        )}

                        {rule.endDate && (
                          <>
                            <span>•</span>
                            <span>สิ้นสุด {formatThaiDate(rule.endDate)}</span>
                          </>
                        )}
                      </div>

                      <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-muted">
                        {rule.active && !rule.finished && (
                          <span>
                            ครั้งถัดไป {formatThaiDate(rule.nextRunDate)} (
                            {relativeDays(rule.nextRunDate, today)})
                          </span>
                        )}

                        {!rule.active && !rule.finished && (
                          <span>
                            เปิดใหม่แล้วจะเริ่มงวดถัดไปที่ยังไม่ถึงวัน
                            (ไม่สร้างย้อนหลัง)
                          </span>
                        )}

                        <span className="text-faint">
                          {rule.lastRunDate
                            ? `สร้างล่าสุด ${formatThaiDate(rule.lastRunDate)}`
                            : "ยังไม่เคยสร้าง"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <p
                        className={`text-sm font-medium ${
                          dim ? "opacity-60 " : ""
                        }${
                          rule.type === "INCOME"
                            ? "text-income"
                            : "text-expense"
                        }`}
                      >
                        {rule.type === "INCOME" ? "+" : "-"}฿
                        {money(Number(rule.amount))}
                      </p>

                      <RecurringActions
                        id={rule.id}
                        active={rule.active}
                        finished={rule.finished}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
