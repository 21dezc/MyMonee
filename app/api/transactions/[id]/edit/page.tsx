"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditTransactionPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [transactionResponse, categoriesResponse] =
          await Promise.all([
            fetch(`/api/transactions/${id}`),
            fetch("/api/categories"),
          ]);

        const transactionData = await transactionResponse.json();
        const categoriesData = await categoriesResponse.json();

        if (!transactionResponse.ok) {
          setError(transactionData.error || "ไม่พบรายการ");
          return;
        }

        setType(transactionData.type);
        setAmount(String(transactionData.amount));
        setDescription(transactionData.description || "");
        setDate(
          new Date(transactionData.date)
            .toISOString()
            .split("T")[0]
        );
        setCategoryId(transactionData.categoryId);

        if (categoriesResponse.ok) {
          setCategories(categoriesData);
        }
      } catch {
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSaving(true);

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
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
        setError(data.error || "แก้ไขรายการไม่สำเร็จ");
        return;
      }

      router.push("/dashboard/transactions");
      router.refresh();
    } catch {
      setError("ไม่สามารถเชื่อมต่อ Server ได้");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-xl">
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl bg-white p-8 shadow">
          <h1 className="text-3xl font-bold">
            แก้ไขรายการ
          </h1>

          <p className="mt-2 text-gray-500">
            แก้ไขข้อมูลรายรับหรือรายจ่าย
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
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

            <div>
              <label className="mb-2 block font-medium">
                หมวดหมู่
              </label>

              <select
                value={categoryId}
                onChange={(e) =>
                  setCategoryId(e.target.value)
                }
                className="w-full rounded-xl border px-4 py-3"
                required
              >
                <option value="">
                  เลือกหมวดหมู่
                </option>

                {categories
                  .filter(
                    (category) => category.type === type
                  )
                  .map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-medium">
                จำนวนเงิน
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                className="w-full rounded-xl border px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                รายละเอียด
              </label>

              <input
                type="text"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                วันที่
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(e.target.value)
                }
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-black py-3 font-medium text-white disabled:opacity-50"
            >
              {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </button>

            <button
              type="button"
              onClick={() =>
                router.push("/dashboard/transactions")
              }
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