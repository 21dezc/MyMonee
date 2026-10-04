import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      date: "desc",
    },
  });

  const income = transactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const expense = transactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const balance = income - expense;

  return (
    <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-6xl">

        <h1 className="text-3xl font-bold">
            สวัสดี {session.user.name || "ผู้ใช้งาน"} 👋
        </h1>

        <p className="mt-2 text-gray-500">
            ยินดีต้อนรับเข้าสู่ MyMonee
        </p>

        {/* สรุปยอดเงิน */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">

            <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
                ยอดเงินคงเหลือ
            </p>

            <p className="mt-2 text-3xl font-bold">
                ฿{balance.toLocaleString("th-TH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                })}
            </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
                รายรับทั้งหมด
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
                ฿{income.toLocaleString("th-TH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                })}
            </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
                รายจ่ายทั้งหมด
            </p>

            <p className="mt-2 text-3xl font-bold text-red-500">
                ฿{expense.toLocaleString("th-TH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                })}
            </p>
            </div>

        </div>

        {/* ปุ่มเพิ่มรายการ */}
        <div className="mt-6">
            <a
            href="/dashboard/add"
            className="inline-block rounded-xl bg-black px-6 py-3 font-medium text-white hover:opacity-90"
            >
            + เพิ่มรายการ
            </a>
        </div>

        {/* รายการล่าสุด */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow">

            <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
                รายการล่าสุด
            </h2>

            <a
                href="/dashboard/transactions"
                className="text-sm font-medium text-blue-600 hover:underline"
            >
                ดูทั้งหมด →
            </a>
            </div>

            <div className="mt-5 space-y-3">

            {transactions.length === 0 ? (
                <p className="py-8 text-center text-gray-400">
                ยังไม่มีรายการ
                </p>
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
                        {new Date(transaction.date).toLocaleDateString(
                        "th-TH"
                        )}
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

        </div>
    </main>
    );
}