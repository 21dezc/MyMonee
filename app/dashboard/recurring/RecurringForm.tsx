"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
};

export default function RecurringForm({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();

  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [dayOfMonth, setDayOfMonth] = useState("1");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    const numericAmount = Number(amount);
    const day = Number(dayOfMonth);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("จำนวนเงินต้องเป็นตัวเลขที่มากกว่า 0");
      return;
    }

    if (!categoryId) {
      setError("กรุณาเลือกหมวดหมู่");
      return;
    }

    if (!Number.isInteger(day) || day < 1 || day > 31) {
      setError("วันที่ต้องอยู่ระหว่าง 1-31");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          categoryId,
          amount: numericAmount,
          description: description.trim(),
          dayOfMonth: day,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "เพิ่มรายการประจำไม่สำเร็จ");
        return;
      }

      setAmount("");
      setDescription("");
      setCategoryId("");

      router.refresh();
    } catch {
      setError("ไม่สามารถเชื่อมต่อ Server ได้");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-5">
      {/* ประเภท */}
      <div>
        <label className="label">ประเภท</label>

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

      <div className="grid gap-5 md:grid-cols-2">
        {/* หมวดหมู่ */}
        <div>
          <label className="label">หมวดหมู่</label>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="field"
            required
          >
            <option value="">เลือกหมวดหมู่</option>

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
          <label className="label">จำนวนเงิน</label>

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
          <label className="label">รายละเอียด</label>

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="เช่น ค่าเช่าห้อง"
            className="field"
            maxLength={200}
          />
        </div>

        {/* วันที่ของเดือน */}
        <div>
          <label className="label">เกิดขึ้นทุกวันที่</label>

          <input
            type="number"
            min="1"
            max="31"
            step="1"
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            className="field"
            required
          />

          <p className="mt-1 text-xs text-faint">
            เดือนที่ไม่มีวันที่นั้น (เช่น 31 ในเดือนกุมภาพันธ์)
            ระบบจะใช้วันสุดท้ายของเดือนแทน
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-expense/10 p-3 text-sm text-expense">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? "กำลังบันทึก..." : "เพิ่มรายการประจำ"}
      </button>
    </form>
  );
}
