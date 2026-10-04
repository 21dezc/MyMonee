"use client";

import { useMemo, useState } from "react";
import DeleteButton from "./DeleteButton";
import TransactionFilters from "./TransactionFilters";

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
        <p className="mb-4 text-sm text-gray-500">
          แสดง {filteredTransactions.length} รายการ
          จาก {transactions.length} รายการ
        </p>

        {filteredTransactions.length === 0 ? (
          <p className="py-10 text-center text-gray-400">
            ไม่พบรายการที่ค้นหา
          </p>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map(
              (transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-xl border p-4"
                >
                  <div>
                    <p className="font-medium">
                      {transaction.description ||
                        "ไม่มีรายละเอียด"}
                    </p>

                    <div className="mt-1 flex gap-2 text-sm text-gray-400">
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
                      className={`font-bold ${
                        transaction.type ===
                        "INCOME"
                          ? "text-green-600"
                          : "text-red-500"
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

                    <a
                      href={`/dashboard/transactions/${transaction.id}/edit`}
                      className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-100"
                    >
                      แก้ไข
                    </a>

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