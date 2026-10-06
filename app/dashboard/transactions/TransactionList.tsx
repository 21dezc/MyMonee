"use client";

import { useMemo, useState } from "react";
import DeleteButton from "./DeleteButton";
import TransactionFilters from "./TransactionFilters";
import Link from "next/link";

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
};

export default function TransactionList({
  transactions,
  categories,
}: TransactionListProps) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<
    "ALL" | "INCOME" | "EXPENSE"
  >("ALL");
  const [categoryId, setCategoryId] = useState("");
  const [month, setMonth] = useState("");

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // ค้นหา
      const searchMatch =
        !search ||
        (transaction.description || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      // ประเภท
      const typeMatch =
        type === "ALL" ||
        transaction.type === type;

      // หมวดหมู่
      const categoryMatch =
        !categoryId ||
        transaction.categoryId === categoryId;

      // เดือน
      const transactionMonth = new Date(
        transaction.date
      )
        .toISOString()
        .slice(0, 7);

      const monthMatch =
        !month || transactionMonth === month;

      return (
        searchMatch &&
        typeMatch &&
        categoryMatch &&
        monthMatch
      );
    });
  }, [
    transactions,
    search,
    type,
    categoryId,
    month,
  ]);

  return (
    <>
      <TransactionFilters
        search={search}
        setSearch={setSearch}
        type={type}
        setType={setType}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        month={month}
        setMonth={setMonth}
        categories={categories}
      />

      <div className="mt-6">
        <p className="mb-2 text-xs text-muted">
          แสดง {filteredTransactions.length} รายการ
          จาก {transactions.length} รายการ
        </p>

        {filteredTransactions.length === 0 ? (
          <p className="py-10 text-center text-faint">
            ไม่พบรายการที่ค้นหา
          </p>
        ) : (
          <div>
            {filteredTransactions.map(
              (transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-3 border-b border-line py-4 last:border-b-0"
                >
                  <div>
                    <p className="text-sm">
                      {transaction.description ||
                        "ไม่มีรายละเอียด"}
                    </p>

                    <div className="mt-0.5 flex gap-2 text-xs text-faint">
                      <span>
                        {transaction.category.name}
                      </span>

                      <span>•</span>

                      <span>
                        {new Date(
                          transaction.date
                        ).toLocaleDateString(
                          "th-TH"
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <p
                      className={`text-sm font-medium ${
                        transaction.type ===
                        "INCOME"
                          ? "text-income"
                          : "text-expense"
                      }`}
                    >
                      {transaction.type ===
                      "INCOME"
                        ? "+"
                        : "-"}
                      ฿
                      {Number(
                        transaction.amount
                      ).toLocaleString(
                        "th-TH",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </p>

                    <Link
                      href={`/dashboard/transactions/${transaction.id}/edit`}
                      className="chip chip-info"
                    >
                      แก้ไข
                    </Link>

                    <DeleteButton
                      id={transaction.id}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </>
  );
}