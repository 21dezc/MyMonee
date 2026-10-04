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

  return (
    <main>
      

        {/* Header */}
        <h1 className="text-3xl font-bold">
          สวัสดี {session.user.name || "ผู้ใช้งาน"} 👋
        </h1>

        <p className="mt-2 text-gray-500">ยินดีต้อนรับเข้าสู่ MyMonee</p>

        {/* Summary */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {/* Balance */}
          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">ยอดเงินคงเหลือ</p>

            <p className="mt-2 text-3xl font-bold">
              ฿
              {balance.toLocaleString("th-TH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* Income */}
          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">รายรับทั้งหมด</p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              ฿
              {income.toLocaleString("th-TH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* Expense */}
          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">รายจ่ายทั้งหมด</p>

            <p className="mt-2 text-3xl font-bold text-red-500">
              ฿
              {expense.toLocaleString("th-TH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        {/* Add transaction */}
        <div className="mt-6">
          <a
            href="/dashboard/add"
            className="inline-block rounded-xl bg-black px-6 py-3 font-medium text-white hover:opacity-90"
          >
            + เพิ่มรายการ
          </a>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <DashboardCharts data={chartData} categoryData={categoryData} />
        )}

        {/* สรุปเดือนนี้ */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">สรุปเดือนนี้</h2>

              <p className="mt-1 text-sm text-gray-500">
                ภาพรวมรายรับและรายจ่ายของเดือนปัจจุบัน
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
              {now.toLocaleDateString("th-TH", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {/* รายรับ */}
            <div className="rounded-xl bg-green-50 p-5">
              <p className="text-sm text-gray-500">รายรับเดือนนี้</p>

              <p className="mt-2 text-2xl font-bold text-green-600">
                ฿
                {monthlyIncome.toLocaleString("th-TH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            {/* รายจ่าย */}
            <div className="rounded-xl bg-red-50 p-5">
              <p className="text-sm text-gray-500">รายจ่ายเดือนนี้</p>

              <p className="mt-2 text-2xl font-bold text-red-500">
                ฿
                {monthlyExpense.toLocaleString("th-TH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            {/* คงเหลือ */}
            <div className="rounded-xl bg-blue-50 p-5">
              <p className="text-sm text-gray-500">คงเหลือเดือนนี้</p>

              <p className="mt-2 text-2xl font-bold text-blue-600">
                ฿
                {monthlyBalance.toLocaleString("th-TH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-gray-500">สัดส่วนรายจ่ายต่อรายรับ</span>

              <span className="font-medium">{expensePercentage.toFixed(1)}%</span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-red-400 transition-all"
                style={{
                  width: `${Math.min(expensePercentage, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">รายการล่าสุด</h2>

            <a
              href="/dashboard/transactions"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              ดูทั้งหมด →
            </a>
          </div>

          <div className="mt-5 space-y-3">
            {transactions.length === 0 ? (
              <p className="py-8 text-center text-gray-400">ยังไม่มีรายการ</p>
            ) : (
              transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-xl border p-4"
                >
                  <div>
                    <p className="font-medium">
                      {transaction.description || "ไม่มีรายละเอียด"}
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      {new Date(transaction.date).toLocaleDateString("th-TH")}
                    </p>
                  </div>

                  <p
                    className={`font-bold ${
                      transaction.type === "INCOME"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {transaction.type === "INCOME" ? "+" : "-"}฿
                    {Number(transaction.amount).toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      
    </main>
  );
}