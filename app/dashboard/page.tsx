import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import DashboardCharts from "./DashboardCharts";


export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      category: true,
    },
    orderBy: {
      date: "desc",
    },
  });

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

  const now = new Date();

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const currentMonthTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date);

    return (
      date.getFullYear() === currentYear && date.getMonth() === currentMonth
    );
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
    const date = new Date(transaction.date);

    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const key = `${year}-${String(month).padStart(2, "0")}`;

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
        <a
          href="/dashboard/add"
          className="btn-ghost !rounded-full !px-4 !py-1.5 text-sm"
        >
          + เพิ่มรายการ
        </a>
      </div>

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

          <a
            href="/dashboard/transactions"
            className="text-sm text-muted hover:text-ink"
          >
            ดูทั้งหมด →
          </a>
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
                  <p className="text-sm">
                    {transaction.description || "ไม่มีรายละเอียด"}
                  </p>
                  <p className="mt-0.5 text-xs text-faint">
                    {new Date(transaction.date).toLocaleDateString("th-TH")}
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
