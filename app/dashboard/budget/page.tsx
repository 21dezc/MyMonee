"use client";

import { useEffect, useState } from "react";
import DeleteBudgetButton from "./DeleteBudgetButton";

type Category = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
};

type Budget = {
  id: string;
  amount: string | number;
  month: number;
  year: number;
  categoryId: string;
  category: Category;
};

type Transaction = {
  id: string;
  amount: string | number;
  type: "INCOME" | "EXPENSE";
  categoryId: string;
  date: string;
};

export default function BudgetPage() {
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);

  const [year, setYear] = useState(today.getFullYear());

  const [categories, setCategories] = useState<Category[]>([]);

  const [budgets, setBudgets] = useState<Budget[]>([]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [categoryId, setCategoryId] = useState("");

  const [amount, setAmount] = useState("");

  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  // =========================
  // โหลดข้อมูล
  // =========================

  async function loadData() {
    try {
      setLoading(true);

      const [categoryResponse, budgetResponse] = await Promise.all([
        fetch("/api/categories"),
        fetch(`/api/budgets?month=${month}&year=${year}`),
      ]);

      const categoryData = await categoryResponse.json();

      const budgetData = await budgetResponse.json();

      setCategories(
        categoryData.filter((category: Category) => category.type === "EXPENSE")
      );

      setBudgets(budgetData);

      // ดึงรายการทั้งหมด
      const transactionResponse = await fetch("/api/transactions");

      if (transactionResponse.ok) {
        const transactionData = await transactionResponse.json();

        setTransactions(transactionData);
      }
    } catch (error) {
      console.error(error);
      alert("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [month, year]);

  // =========================
  // เพิ่ม / แก้ไขงบ
  // =========================

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!categoryId || !amount) {
      alert("กรุณาเลือกหมวดหมู่และกรอกงบประมาณ");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          month,
          year,
          categoryId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "ไม่สามารถบันทึกงบประมาณได้");
        return;
      }

      alert(editingBudgetId ? "แก้ไขงบประมาณสำเร็จ" : "บันทึกงบประมาณสำเร็จ");

      setCategoryId("");
      setAmount("");
      setEditingBudgetId(null);

      await loadData();
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // กดแก้ไขงบ
  // =========================

  function handleEdit(budget: Budget) {
    setEditingBudgetId(budget.id);
    setCategoryId(budget.categoryId);
    setAmount(String(budget.amount));
  }

  // =========================
  // คำนวณยอดใช้จริง
  // =========================

  function getSpent(categoryId: string) {
    return transactions
      .filter((transaction) => {
        const date = new Date(transaction.date);

        return (
          transaction.type === "EXPENSE" &&
          transaction.categoryId === categoryId &&
          date.getMonth() + 1 === month &&
          date.getFullYear() === year
        );
      })
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  }

  // =========================
  // Format เงิน
  // =========================

  function formatMoney(value: number) {
    return value.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const monthName = new Date(year, month - 1, 1).toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <main className="pb-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-muted">กำลังโหลดข้อมูล...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">งบประมาณ</h1>

            <p className="mt-1 text-xs text-muted">วางแผนและติดตามรายจ่ายของคุณ</p>
          </div>

          
        </div>

        {/* Month */}
        <div className="mt-8 card p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div>
              <label className="label">เดือน</label>

              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="field field-auto"
              >
                {Array.from({ length: 12 }, (_, index) => index + 1).map(
                  (value) => (
                    <option key={value} value={value}>
                      {new Date(2026, value - 1, 1).toLocaleDateString(
                        "th-TH",
                        {
                          month: "long",
                        }
                      )}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="label">ปี</label>

              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="field field-auto"
              >
                {[
                  today.getFullYear() - 1,
                  today.getFullYear(),
                  today.getFullYear() + 1,
                ].map((value) => (
                  <option key={value} value={value}>
                    {value + 543}
                  </option>
                ))}
              </select>
            </div>

            <div className="pb-2 font-medium text-muted">{monthName}</div>
          </div>
        </div>

        {/* Add Budget */}
        <div className="card mt-6 p-6">
          <h2 className="text-lg font-semibold">ตั้งงบประมาณ</h2>

          <p className="mt-1 text-sm text-muted">
            กำหนดงบสำหรับแต่ละหมวดหมู่รายจ่าย
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-4 md:grid-cols-3"
          >
            <div>
              <label className="label">หมวดหมู่</label>

              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="field"
              >
                <option value="">เลือกหมวดหมู่</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">งบประมาณ</label>

              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="เช่น 4000"
                className="field"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex-1"
              >
                {saving
                  ? "กำลังบันทึก..."
                  : editingBudgetId
                    ? "บันทึกการแก้ไข"
                    : "+ บันทึกงบประมาณ"}
              </button>

              {editingBudgetId && (
                <button
                  type="button"
                  onClick={() => {
                    setCategoryId("");
                    setAmount("");
                    setEditingBudgetId(null);
                  }}
                  className="btn-ghost"
                >
                  ยกเลิก
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Budget List */}
        <div className="mt-6">
          <h2 className="mb-4 text-lg font-semibold">งบประมาณของเดือนนี้</h2>

          {budgets.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-faint">
                ยังไม่ได้ตั้งงบประมาณสำหรับเดือนนี้
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {budgets.map((budget) => {
                const budgetAmount = Number(budget.amount);

                const spent = getSpent(budget.categoryId);

                const remaining = budgetAmount - spent;

                const percentage =
                  budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

                const isOver = spent > budgetAmount;

                return (
                  <div
                    key={budget.id}
                    className="card p-6"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold">
                        {budget.category.name}
                      </h3>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-sm font-medium ${
                            isOver ? "text-expense" : "text-muted"
                          }`}
                        >
                          {Math.round(percentage)}%
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(budget)}
                            className="chip chip-info"
                          >
                            แก้ไข
                          </button>

                          <DeleteBudgetButton
                            id={budget.id}
                            onDeleted={loadData}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-muted">ใช้ไป</span>

                        <span className="font-medium">
                          ฿{formatMoney(spent)} / ฿{formatMoney(budgetAmount)}
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-line">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOver ? "bg-expense" : "bg-info"
                          }`}
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      {isOver ? (
                        <p className="font-medium text-expense">
                          เกินงบ ฿{formatMoney(Math.abs(remaining))}
                        </p>
                      ) : (
                        <p className="font-medium text-income">
                          เหลืองบ ฿{formatMoney(remaining)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}