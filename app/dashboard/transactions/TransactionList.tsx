"use client";

import Link from "next/link";
import DeleteButton from "./DeleteButton";
import TransactionFilters from "./TransactionFilters";
import {
  PAGE_SIZE,
  buildQuery,
  type TransactionFilterValues,
} from "@/lib/transactionFilters";

type Transaction = {
  id: string;
  amount: string | number;
  type: "INCOME" | "EXPENSE";
  description: string | null;
  date: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    type: "INCOME" | "EXPENSE";
  };
};

type Category = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
};

type TransactionListProps = {
  transactions: Transaction[];
  categories: Category[];
  filters: TransactionFilterValues;
  page: number;
  totalPages: number;
  total: number;
  income: number;
  expense: number;
};

function money(value: number) {
  return value.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function TransactionList({
  transactions,
  categories,
  filters,
  page,
  totalPages,
  total,
  income,
  expense,
}: TransactionListProps) {
  const pageHref = (target: number) => {
    const query = buildQuery(filters, target);

    return query
      ? `/dashboard/transactions?${query}`
      : "/dashboard/transactions";
  };

  const exportQuery = buildQuery(filters);
  const exportHref = exportQuery
    ? `/api/transactions/export?${exportQuery}`
    : "/api/transactions/export";

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <>
      <TransactionFilters filters={filters} categories={categories} />

      {/* สรุปตามตัวกรอง */}
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-line p-4">
          <p className="text-xs text-muted">รายรับ (ตามตัวกรอง)</p>
          <p className="mt-1 text-lg font-semibold text-income">
            ฿{money(income)}
          </p>
        </div>

        <div className="rounded-2xl bg-line p-4">
          <p className="text-xs text-muted">รายจ่าย (ตามตัวกรอง)</p>
          <p className="mt-1 text-lg font-semibold text-expense">
            ฿{money(expense)}
          </p>
        </div>

        <div className="rounded-2xl bg-line p-4">
          <p className="text-xs text-muted">คงเหลือ</p>
          <p className="mt-1 text-lg font-semibold">
            ฿{money(income - expense)}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted">
            {total === 0
              ? "ไม่พบรายการ"
              : `แสดง ${from}-${to} จาก ${total} รายการ`}
          </p>

          {/* ใช้ <a> ธรรมดา เพราะเป็นการดาวน์โหลดไฟล์ */}
          <a
            href={exportHref}
            download
            className="chip chip-info"
          >
            ดาวน์โหลด CSV
          </a>
        </div>

        {transactions.length === 0 ? (
          <p className="py-10 text-center text-faint">
            ไม่พบรายการที่ค้นหา
          </p>
        ) : (
          <div>
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between gap-3 border-b border-line py-4 last:border-b-0"
              >
                <div>
                  <p className="text-sm">
                    {transaction.description || "ไม่มีรายละเอียด"}
                  </p>

                  <div className="mt-0.5 flex gap-2 text-xs text-faint">
                    <span>{transaction.category.name}</span>

                    <span>•</span>

                    <span>
                      {new Date(transaction.date).toLocaleDateString(
                        "th-TH",
                        { timeZone: "Asia/Bangkok" }
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
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

                  <Link
                    href={`/dashboard/transactions/${transaction.id}/edit`}
                    className="chip chip-info"
                  >
                    แก้ไข
                  </Link>

                  <DeleteButton id={transaction.id} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* แบ่งหน้า */}
        {totalPages > 1 && (
          <nav
            aria-label="แบ่งหน้า"
            className="mt-6 flex items-center justify-between gap-3"
          >
            {page > 1 ? (
              <Link href={pageHref(page - 1)} className="btn-ghost !px-4 !py-1.5 text-sm">
                ← ก่อนหน้า
              </Link>
            ) : (
              <span className="btn-ghost pointer-events-none !px-4 !py-1.5 text-sm opacity-40">
                ← ก่อนหน้า
              </span>
            )}

            <span className="text-xs text-muted">
              หน้า {page} / {totalPages}
            </span>

            {page < totalPages ? (
              <Link href={pageHref(page + 1)} className="btn-ghost !px-4 !py-1.5 text-sm">
                ถัดไป →
              </Link>
            ) : (
              <span className="btn-ghost pointer-events-none !px-4 !py-1.5 text-sm opacity-40">
                ถัดไป →
              </span>
            )}
          </nav>
        )}
      </div>
    </>
  );
}
