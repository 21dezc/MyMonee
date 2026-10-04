import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import DeleteButton from "./DeleteButton";

export default async function TransactionsPage() {
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

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              รายการทั้งหมด
            </h1>

            <p className="mt-2 text-gray-500">
              รายรับและรายจ่ายทั้งหมดของคุณ
            </p>
          </div>

          <a
            href="/dashboard/add"
            className="rounded-xl bg-black px-5 py-3 font-medium text-white hover:opacity-90"
          >
            + เพิ่มรายการ
          </a>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow">
          {transactions.length === 0 ? (
            <p className="py-10 text-center text-gray-400">
              ยังไม่มีรายการ
            </p>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-xl border p-4"
                >
                  <div>
                    <p className="font-medium">
                      {transaction.description || "ไม่มีรายละเอียด"}
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      {new Date(
                        transaction.date
                      ).toLocaleDateString("th-TH")}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <p
                      className={`font-bold ${
                        transaction.type === "INCOME"
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {transaction.type === "INCOME" ? "+" : "-"}฿
                      {Number(
                        transaction.amount
                      ).toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>

                    <a
                      href={`/dashboard/transactions/${transaction.id}/edit`}
                      className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-100"
                    >
                      แก้ไข
                    </a>

                    <DeleteButton id={transaction.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          <a
            href="/dashboard"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← กลับ Dashboard
          </a>
        </div>

      </div>
    </main>
  );
}