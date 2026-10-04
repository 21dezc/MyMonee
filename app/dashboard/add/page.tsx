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
    setLoading(true);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          type,
          description,
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
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl bg-white p-8 shadow">
          <h1 className="text-3xl font-bold">
            เพิ่มรายการ
          </h1>

          <p className="mt-2 text-gray-500">
            บันทึกรายรับหรือรายจ่ายของคุณ
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">

            {/* ประเภท */}
            <div>
              <label className="mb-2 block font-medium">
                ประเภท
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setType("INCOME");
                    setCategoryId("");
                  }}
                  className={`rounded-xl border p-3 ${
                    type === "INCOME"
                      ? "bg-green-500 text-white"
                      : "bg-white"
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
                  className={`rounded-xl border p-3 ${
                    type === "EXPENSE"
                      ? "bg-red-500 text-white"
                      : "bg-white"
                  }`}
                >
                  รายจ่าย
                </button>
              </div>
            </div>

            {/* หมวดหมู่ */}
            <div>
              <label className="mb-2 block font-medium">
                หมวดหมู่
              </label>

              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
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
              <label className="mb-2 block font-medium">
                จำนวนเงิน
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
                required
              />
            </div>

            {/* รายละเอียด */}
            <div>
              <label className="mb-2 block font-medium">
                รายละเอียด
              </label>

              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="เช่น ค่าอาหารกลางวัน"
                className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
              />
            </div>

            {/* วันที่ */}
            <div>
              <label className="mb-2 block font-medium">
                วันที่
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            {/* บันทึก */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-black py-3 font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "กำลังบันทึก..." : "บันทึกรายการ"}
            </button>

            {/* ยกเลิก */}
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full rounded-xl border py-3 font-medium"
            >
              ยกเลิก
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}