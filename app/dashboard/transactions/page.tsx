import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import TransactionList from "./TransactionList";

export default async function TransactionsPage() {
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

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const formattedTransactions = transactions.map(
    (transaction) => ({
      ...transaction,
      amount: transaction.amount.toString(),
      date: transaction.date.toISOString(),
    })
  );

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
          <TransactionList
            transactions={formattedTransactions}
            categories={categories}
          />
        </div>

        <div className="mt-6 flex items-center gap-3">

       

      </div>

      </div>
    </main>
  );
}