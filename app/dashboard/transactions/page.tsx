import { getSession } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { processRecurring } from "@/lib/recurring";
import {
  PAGE_SIZE,
  buildWhere,
  parseFilters,
  parsePage,
} from "@/lib/transactionFilters";
import TransactionList from "./TransactionList";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TransactionsPage({ searchParams }: PageProps) {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const params = await searchParams;

  const filters = parseFilters(params);
  const requestedPage = parsePage(params);

  // สร้างรายการจากรายการประจำที่ถึงกำหนดก่อน แล้วค่อยดึงข้อมูล
  await processRecurring(userId);

  const where = buildWhere(userId, filters);

  const [total, totals, categories] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.groupBy({
      by: ["type"],
      where,
      _sum: { amount: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const sumOf = (type: "INCOME" | "EXPENSE") =>
    Number(totals.find((row) => row.type === type)?._sum.amount ?? 0);

  const formattedTransactions = transactions.map((transaction) => ({
    ...transaction,
    amount: transaction.amount.toString(),
    date: transaction.date.toISOString(),
  }));

  return (
    <main className="pb-10">
      <h1 className="text-2xl font-semibold">รายการทั้งหมด</h1>

      <p className="mt-1 text-xs text-muted">
        รายรับและรายจ่ายทั้งหมดของคุณ
      </p>

      <TransactionList
        transactions={formattedTransactions}
        categories={categories}
        filters={filters}
        page={page}
        totalPages={totalPages}
        total={total}
        income={sumOf("INCOME")}
        expense={sumOf("EXPENSE")}
      />
    </main>
  );
}
