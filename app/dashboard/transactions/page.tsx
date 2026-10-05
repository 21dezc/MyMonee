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
    <main className="pb-10">
      <h1 className="text-2xl font-semibold">รายการทั้งหมด</h1>

      <p className="mt-1 text-xs text-muted">
        รายรับและรายจ่ายทั้งหมดของคุณ
      </p>

      <TransactionList
        transactions={formattedTransactions}
        categories={categories}
      />
    </main>
  );
}
