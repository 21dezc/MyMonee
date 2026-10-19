import { getSession } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import DashboardCharts from "./DashboardCharts";
import RecurringCard from "./RecurringCard";
import { processRecurring } from "@/lib/recurring";
import { bangkokParts, ymKey } from "@/lib/date";
import Link from "next/link";


export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // สร้างรายการจากรายการประจำที่ถึงกำหนดก่อน แล้วค่อยดึงข้อมูล
  await processRecurring(userId);

  // เวลาไทย (บน Vercel เครื่องใช้เวลา UTC)
  const now = new Date();
  const today = bangkokParts(now);

  const [transactions, budgets, recurringRules] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
      },
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    }),
    prisma.budget.findMany({
      where: {
        userId,
        month: today.month,
        year: today.year,
      },
      include: {
        category: true,
      },
    }),
    prisma.recurringTransaction.findMany({
      where: { userId, active: true, finished: false },
      include: { category: true },
      orderBy: { nextRunDate: "asc" },
    }),
  ]);

  // =========================
  // คำนวณยอดรวม
  // =========================

  const income = transactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const expense = transactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const balance = income - expense;

  // =========================
  // สรุปข้อมูลเดือนปัจจุบัน
  // =========================

  const currentMonthTransactions = transactions.filter((transaction) => {
    const date = bangkokParts(new Date(transaction.date));

    return date.year === today.year && date.month === today.month;
  });

  const monthlyIncome = currentMonthTransactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const monthlyExpense = currentMonthTransactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const monthlyBalance = monthlyIncome - monthlyExpense;

  const expensePercentage =
    monthlyIncome > 0 ? (monthlyExpense / monthlyIncome) * 100 : 0;

  // =========================
  // เตรียมข้อมูลกราฟรายเดือน
  // =========================

  const monthlyData: Record<
    string,
    {
      month: string;
      income: number;
      expense: number;
    }
  > = {};

  transactions.forEach((transaction) => {
    const { year, month } = bangkokParts(new Date(transaction.date));

    const key = ymKey(year, month);

    if (!monthlyData[key]) {
      monthlyData[key] = {
        month: `${month}/${year}`,
        income: 0,
        expense: 0,
      };
    }

    if (transaction.type === "INCOME") {
      monthlyData[key].income += Number(transaction.amount);
    }

    if (transaction.type === "EXPENSE") {
      monthlyData[key].expense += Number(transaction.amount);
    }
  });

  const chartData = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, data]) => data);

  // =========================
  // เตรียมข้อมูลรายจ่ายตามหมวดหมู่
  // =========================

  const categoryExpenses: Record<string, number> = {};

  transactions.forEach((transaction) => {
    if (transaction.type !== "EXPENSE") {
      return;
    }

    const categoryName = transaction.category?.name || "อื่นๆ";

    if (!categoryExpenses[categoryName]) {
      categoryExpenses[categoryName] = 0;
    }

    categoryExpenses[categoryName] += Number(transaction.amount);
  });

  const categoryData = Object.entries(categoryExpenses)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  // =========================
  // แจ้งเตือนงบประมาณเดือนนี้ (ใช้ตั้งแต่ 80% ขึ้นไป)
  // =========================

  const spentByCategory: Record<string, number> = {};

  currentMonthTransactions.forEach((transaction) => {
    if (transaction.type !== "EXPENSE") {
      return;
    }

    spentByCategory[transaction.categoryId] =
      (spentByCategory[transaction.categoryId] ?? 0) +
      Number(transaction.amount);
  });

  const budgetAlerts = budgets
    .map((budget) => {
      const limit = Number(budget.amount);
      const spent = spentByCategory[budget.categoryId] ?? 0;

      return {
        id: budget.id,
        name: budget.category.name,
        limit,
        spent,
        percent: limit > 0 ? (spent / limit) * 100 : 0,
      };
    })
    .filter((item) => item.percent >= 80)
    .sort((a, b) => b.percent - a.percent);

  const money = (value: number) =>
    value.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <main>
      {/* Header */}
      <h1 className="text-2xl font-semibold">
        สวัสดี {session.user.name || "ผู้ใช้งาน"} 👋
      </h1>
      <p className="mt-1 text-sm text-muted">ยินดีต้อนรับเข้าสู่ MyMonee</p>

      {/* Summary */}
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs text-muted">ยอดเงินคงเหลือ</p>
          <p className="mt-2 text-2xl font-semibold">฿{money(balance)}</p>
        </div>

        <div className="card p-5">
          <p className="text-xs text-muted">รายรับทั้งหมด</p>
          <p className="mt-2 text-2xl font-semibold text-income">
            ฿{money(income)}
          </p>
        </div>

        <div className="card p-5">
          <p className="text-xs text-muted">รายจ่ายทั้งหมด</p>
          <p className="mt-2 text-2xl font-semibold text-expense">
            ฿{money(expense)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <Link
          href="/dashboard/add"
          className="btn-ghost !rounded-full !px-4 !py-1.5 text-sm"
        >
          + เพิ่มรายการ
        </Link>
      </div>

      {/* แจ้งเตือนงบประมาณ */}
      {budgetAlerts.length > 0 && (
        <section className="card mt-6 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">แจ้งเตือนงบประมาณ</h2>
              <p className="mt-1 text-xs text-muted">
                หมวดที่ใช้ไปตั้งแต่ 80% ของงบเดือนนี้
              </p>
            </div>

            <Link
              href="/dashboard/budget"
              className="text-sm text-muted hover:text-ink"
            >
              จัดการงบ →
            </Link>
          </div>

          <div className="mt-4 space-y-4">
            {budgetAlerts.map((item) => {
              const over = item.percent >= 100;

              return (
                <div key={item.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2">
                      {item.name}

                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          over
                            ? "bg-expense/10 text-expense"
                            : "bg-warn/10 text-warn"
                        }`}
                      >
                        {over
                          ? `เกินงบ ฿${money(item.spent - item.limit)}`
                          : "ใกล้เต็มงบ"}
                      </span>
                    </span>

                    <span className="text-xs text-muted">
                      ฿{money(item.spent)} / ฿{money(item.limit)} (
                      {item.percent.toFixed(0)}%)
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
                    <div
                      className={`h-full rounded-full transition-all ${
                        over ? "bg-expense" : "bg-warn"
                      }`}
                      style={{ width: `${Math.min(item.percent, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* รายการประจำ */}
      <RecurringCard
        rules={recurringRules.map((rule) => ({
          id: rule.id,
          description: rule.description,
          categoryName: rule.category.name,
          type: rule.type,
          amount: Number(rule.amount),
          frequency: rule.frequency,
          nextRunDate: rule.nextRunDate,
        }))}
      />

      {/* Chart */}
      {chartData.length > 0 && (
        <DashboardCharts data={chartData} categoryData={categoryData} />
      )}

      {/* สรุปเดือนนี้ */}
      <section className="card mt-10 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">สรุปเดือนนี้</h2>
            <p className="mt-1 text-xs text-muted">
              ภาพรวมรายรับและรายจ่ายของเดือนปัจจุบัน
            </p>
          </div>

          <span className="rounded-full bg-line px-3 py-1 text-xs text-ink">
            {now.toLocaleDateString("th-TH", {
              month: "long",
              year: "numeric",
              timeZone: "Asia/Bangkok",
            })}
          </span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-line p-4">
            <p className="text-xs text-muted">รายรับเดือนนี้</p>
            <p className="mt-2 text-xl font-semibold text-income">
              ฿{money(monthlyIncome)}
            </p>
          </div>

          <div className="rounded-2xl bg-line p-4">
            <p className="text-xs text-muted">รายจ่ายเดือนนี้</p>
            <p className="mt-2 text-xl font-semibold text-expense">
              ฿{money(monthlyExpense)}
            </p>
          </div>

          <div className="rounded-2xl bg-line p-4">
            <p className="text-xs text-muted">คงเหลือเดือนนี้</p>
            <p className="mt-2 text-xl font-semibold">
              ฿{money(monthlyBalance)}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6">
          <div className="mb-2 flex justify-between text-xs">
            <span className="text-muted">สัดส่วนรายจ่ายต่อรายรับ</span>
            <span className="text-muted">{expensePercentage.toFixed(1)}%</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-expense transition-all"
              style={{ width: `${Math.min(expensePercentage, 100)}%` }}
            />
          </div>
        </div>
      </section>

      {/* Recent transactions */}
      <section className="mt-10 px-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">รายการล่าสุด</h2>

          <Link
            href="/dashboard/transactions"
            className="text-sm text-muted hover:text-ink"
          >
            ดูทั้งหมด →
          </Link>
        </div>

        <div className="mt-3">
          {transactions.length === 0 ? (
            <p className="py-8 text-center text-faint">ยังไม่มีรายการ</p>
          ) : (
            transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between border-b border-line py-4 last:border-b-0"
              >
                <div>
                  <p className="flex flex-wrap items-center gap-2 text-sm">
                    {transaction.description || "ไม่มีรายละเอียด"}

                    {transaction.recurringId && (
                      <span className="rounded-full bg-info/10 px-2 py-0.5 text-xs text-info">
                        📌 ประจำ
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-faint">
                    {new Date(transaction.date).toLocaleDateString("th-TH", {
                      timeZone: "Asia/Bangkok",
                    })}
                  </p>
                </div>

                <p
                  className={`text-sm font-medium ${
                    transaction.type === "INCOME"
                      ? "text-income"
                      : "text-expense"
                  }`}
                >
                  {transaction.type === "INCOME" ? "+" : "-"}฿
                  {money(Number(transaction.amount))}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
