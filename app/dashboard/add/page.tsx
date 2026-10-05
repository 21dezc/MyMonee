"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AddTransactionPage() {
  const router = useRouter();

  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [categories, setCategories] = useState<
    {
      id: string;
      name: string;
      type: "INCOME" | "EXPENSE";
    }[]
  >([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      const response = await fetch("/api/categories");
      const data = await response.json();

      if (response.ok) {
        setCategories(data);
      }
    }

    loadCategories();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  setError("");

  // ตรวจจำนวนเงิน
  const numericAmount = Number(amount);

  if (!amount.trim()) {
    setError("กรุณากรอกจำนวนเงิน");
    return;
  }

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    setError("จำนวนเงินต้องเป็นตัวเลขที่มากกว่า 0");
    return;
  }

  // ตรวจหมวดหมู่
  if (!categoryId) {
    setError("กรุณาเลือกหมวดหมู่");
    return;
  }

  // ตรวจรายละเอียด
  if (description.length > 200) {
    setError("รายละเอียดต้องไม่เกิน 200 ตัวอักษร");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: numericAmount,
        type,
        description: description.trim(),
        date,
        categoryId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "เพิ่มรายการไม่สำเร็จ");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  } catch {
    setError("ไม่สามารถเชื่อมต่อ Server ได้");
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="pb-10">
      <div className="mx-auto max-w-xl">
        <div className="card p-8">
          <h1 className="text-2xl font-semibold">
            เพิ่มรายการ
          </h1>

          <p className="mt-1 text-xs text-muted">
            บันทึกรายรับหรือรายจ่ายของคุณ
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">

            {/* ประเภท */}
            <div>
              <label className="label">
                ประเภท
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setType("INCOME");
                    setCategoryId("");
                  }}
                  className={`rounded-xl border border-nav p-3 transition-colors ${
                    type === "INCOME"
                      ? "border-income bg-income text-ink"
                      : "bg-paper text-muted"
                  }`}
                >
                  รายรับ
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setType("EXPENSE");
                    setCategoryId("");
                  }}
                  className={`rounded-xl border border-nav p-3 transition-colors ${
                    type === "EXPENSE"
                      ? "border-expense bg-expense text-white"
                      : "bg-paper text-muted"
                  }`}
                >
                  รายจ่าย
                </button>
              </div>
            </div>

            {/* หมวดหมู่ */}
            <div>
              <label className="label">
                หมวดหมู่
              </label>

              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="field"
                required
              >
                <option value="">
                  เลือกหมวดหมู่
                </option>

                {categories
                  .filter((category) => category.type === type)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* จำนวนเงิน */}
            <div>
              <label className="label">
                จำนวนเงิน
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="field"
                required
              />
            </div>

            {/* รายละเอียด */}
            <div>
              <label className="label">
                รายละเอียด
              </label>

              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="เช่น ค่าอาหารกลางวัน"
                className="field"
                maxLength={200}
              />
            </div>

            {/* วันที่ */}
            <div>
              <label className="label">
                วันที่
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="field"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="rounded-xl bg-expense/10 p-3 text-sm text-expense">
                {error}
              </p>
            )}

            {/* บันทึก */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "กำลังบันทึก..." : "บันทึกรายการ"}
            </button>

            {/* ยกเลิก */}
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="btn-ghost w-full"
            >
              ยกเลิก
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}