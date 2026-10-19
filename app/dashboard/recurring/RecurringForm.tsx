"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FREQUENCY_OPTIONS,
  frequencyLabel,
  type Frequency,
} from "@/lib/recurrence";

type Category = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
};

// ค่าเริ่มต้นตอนปักหมุดจากรายการที่มีอยู่แล้ว
export type RecurringInitial = {
  type: "INCOME" | "EXPENSE";
  categoryId: string;
  amount: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  fromTransactionId: string;
};

type LimitMode = "NONE" | "INSTALLMENTS" | "END_DATE";

export default function RecurringForm({
  categories,
  today,
  initial,
}: {
  categories: Category[];
  today: string; // YYYY-MM-DD (เวลาไทย)
  initial?: RecurringInitial;
}) {
  const router = useRouter();

  const [type, setType] = useState<"INCOME" | "EXPENSE">(
    initial?.type ?? "EXPENSE"
  );
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [frequency, setFrequency] = useState<Frequency>("MONTHLY");
  const [startDate, setStartDate] = useState(initial?.startDate ?? today);

  const [limitMode, setLimitMode] = useState<LimitMode>("NONE");
  const [installments, setInstallments] = useState("12");
  const [endDate, setEndDate] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ข้อความอธิบายว่าจะเกิดขึ้นเมื่อไหร่ (อิงวันเริ่มที่เลือก)
  const startAsDate = /^\d{4}-\d{2}-\d{2}$/.test(startDate)
    ? new Date(`${startDate}T00:00:00Z`)
    : null;

  const scheduleHint = startAsDate
    ? frequencyLabel(frequency, startAsDate)
    : "";

  const showMonthEndHint =
    startAsDate !== null &&
    startAsDate.getUTCDate() > 28 &&
    (frequency === "MONTHLY" || frequency === "YEARLY");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("จำนวนเงินต้องเป็นตัวเลขที่มากกว่า 0");
      return;
    }

    if (!categoryId) {
      setError("กรุณาเลือกหมวดหมู่");
      return;
    }

    if (!startAsDate) {
      setError("กรุณาเลือกวันเริ่ม");
      return;
    }

    if (startDate < today) {
      setError("วันเริ่มต้องเป็นวันนี้หรืออนาคต");
      return;
    }

    if (limitMode === "INSTALLMENTS") {
      const n = Number(installments);

      if (!Number.isInteger(n) || n < 1 || n > 360) {
        setError("จำนวนงวดต้องเป็นจำนวนเต็ม 1-360");
        return;
      }
    }

    if (limitMode === "END_DATE") {
      if (!endDate) {
        setError("กรุณาเลือกวันสิ้นสุด");
        return;
      }

      if (endDate < startDate) {
        setError("วันสิ้นสุดต้องไม่ก่อนวันเริ่ม");
        return;
      }
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
          frequency,
          startDate,
          installments:
            limitMode === "INSTALLMENTS" ? Number(installments) : null,
          endDate: limitMode === "END_DATE" ? endDate : null,
          fromTransactionId: initial?.fromTransactionId,
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
      setLimitMode("NONE");

      // ล้าง ?from=... ออกจาก URL แล้วโหลดรายการใหม่
      router.replace("/dashboard/recurring");
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
        <div className="md:col-span-2">
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

        {/* ความถี่ */}
        <div>
          <label className="label">ความถี่</label>

          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Frequency)}
            className="field"
          >
            {FREQUENCY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* วันเริ่ม */}
        <div>
          <label className="label">วันเริ่ม (งวดแรก)</label>

          <input
            type="date"
            min={today}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="field"
            required
          />
        </div>
      </div>

      {scheduleHint && (
        <p className="text-xs text-muted">
          จะสร้างรายการ: {scheduleHint}
          {showMonthEndHint &&
            " (เดือนที่ไม่มีวันที่นั้น เช่น 31 ในเดือนกุมภาพันธ์ ระบบจะใช้วันสุดท้ายของเดือนแทน)"}
        </p>
      )}

      {/* การสิ้นสุด */}
      <div>
        <label className="label">การสิ้นสุด</label>

        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["NONE", "ไม่มีกำหนด"],
              ["INSTALLMENTS", "จำนวนงวด"],
              ["END_DATE", "วันสิ้นสุด"],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setLimitMode(mode)}
              className={`rounded-xl border border-nav p-2.5 text-sm transition-colors ${
                limitMode === mode ? "bg-line text-ink" : "bg-paper text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {limitMode === "INSTALLMENTS" && (
          <div className="mt-3">
            <input
              type="number"
              min="1"
              max="360"
              step="1"
              value={installments}
              onChange={(e) => setInstallments(e.target.value)}
              className="field"
            />

            <p className="mt-1 text-xs text-faint">
              เช่น ผ่อน 12 เดือน = 12 งวด (นับจากงวดแรกที่ระบบจะสร้าง)
              ครบแล้วระบบจะหยุดเอง
            </p>
          </div>
        )}

        {limitMode === "END_DATE" && (
          <div className="mt-3">
            <input
              type="date"
              min={startDate || today}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="field"
            />

            <p className="mt-1 text-xs text-faint">
              งวดที่ตรงหรือก่อนวันสิ้นสุดจะถูกสร้าง งวดหลังจากนั้นระบบจะไม่สร้างให้
            </p>
          </div>
        )}
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
