"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
};

type Transaction = {
  id: string;
  amount: string;
  type: "INCOME" | "EXPENSE";
  description: string | null;
  date: string;
  categoryId: string;
};

export default function EditTransactionPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [transaction, setTransaction] =
    useState<Transaction | null>(null);

  const [categories, setCategories] = useState<Category[]>(
    []
  );

  const [amount, setAmount] = useState("");
  const [type, setType] = useState<
    "INCOME" | "EXPENSE"
  >("EXPENSE");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [transactionResponse, categoryResponse] =
          await Promise.all([
            fetch(`/api/transactions/${id}`),
            fetch("/api/categories"),
          ]);

        const transactionData =
          await transactionResponse.json();

        const categoryData =
          await categoryResponse.json();

        if (!transactionResponse.ok) {
          alert(
            transactionData.error ||
              "ไม่พบรายการนี้"
          );

          router.push("/dashboard/transactions");
          return;
        }

        setTransaction(transactionData);

        setAmount(
          transactionData.amount.toString()
        );

        setType(transactionData.type);

        setDescription(
          transactionData.description || ""
        );

        setCategoryId(
          transactionData.categoryId
        );

        setDate(
          new Date(transactionData.date)
            .toISOString()
            .slice(0, 10)
        );

        setCategories(categoryData);
      } catch (error) {
        console.error(error);
        alert("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, router]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!amount || !categoryId) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/transactions/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
            type,
            description,
            categoryId,
            date,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "ไม่สามารถแก้ไขรายการได้"
        );
        return;
      }

      alert("แก้ไขรายการสำเร็จ");

      router.push("/dashboard/transactions");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการแก้ไขรายการ");
    } finally {
      setSaving(false);
    }
  }

  function handleTypeChange(
    newType: "INCOME" | "EXPENSE"
  ) {
    setType(newType);

    // ล้างหมวดหมู่เดิม เพราะอาจเป็นของอีกประเภท
    setCategoryId("");
  }

  if (loading) {
    return (
      <main className="pb-10">
        <div className="mx-auto max-w-2xl">
          <p className="text-muted">
            กำลังโหลดข้อมูล...
          </p>
        </div>
      </main>
    );
  }

  if (!transaction) {
    return null;
  }

  const filteredCategories = categories.filter(
    (category) => category.type === type
  );

  return (
    <main className="pb-10">
      <div className="mx-auto max-w-2xl">

        <div className="card p-6">

          <h1 className="text-2xl font-semibold">
            แก้ไขรายการ
          </h1>

          <p className="mt-1 text-xs text-muted">
            แก้ไขข้อมูลรายรับหรือรายจ่าย
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >

            {/* จำนวนเงิน */}
            <div>
              <label className="label">
                จำนวนเงิน
              </label>

              <input
                type="number"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                className="field"
              />
            </div>

            {/* ประเภท */}
            <div>
              <label className="label">
                ประเภท
              </label>

              <select
                value={type}
                onChange={(e) =>
                  handleTypeChange(
                    e.target.value as
                      | "INCOME"
                      | "EXPENSE"
                  )
                }
                className="field"
              >
                <option value="INCOME">
                  รายรับ
                </option>

                <option value="EXPENSE">
                  รายจ่าย
                </option>
              </select>
            </div>

            {/* รายละเอียด */}
            <div>
              <label className="label">
                รายละเอียด
              </label>

              <input
                type="text"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                className="field"
              />
            </div>

            {/* หมวดหมู่ */}
            <div>
              <label className="label">
                หมวดหมู่
              </label>

              <select
                value={categoryId}
                onChange={(e) =>
                  setCategoryId(e.target.value)
                }
                className="field"
              >
                <option value="">
                  เลือกหมวดหมู่
                </option>

                {filteredCategories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* วันที่ */}
            <div>
              <label className="label">
                วันที่
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(e.target.value)
                }
                className="field"
              />
            </div>

            {/* ปุ่ม */}
            <div className="flex gap-3 pt-3">

              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
              >
                {saving
                  ? "กำลังบันทึก..."
                  : "บันทึกการแก้ไข"}
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/dashboard/transactions"
                  )
                }
                className="btn-ghost"
              >
                ยกเลิก
              </button>

            </div>

          </form>
        </div>

      </div>
    </main>
  );
}