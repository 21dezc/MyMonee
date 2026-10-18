"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  buildQuery,
  type TransactionFilterValues,
} from "@/lib/transactionFilters";

type Category = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
};

type TransactionFiltersProps = {
  filters: TransactionFilterValues;
  categories: Category[];
};

export default function TransactionFilters({
  filters,
  categories,
}: TransactionFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState(filters.q);

  // ปรับตัวกรอง แล้วกลับไปหน้า 1 (เก็บค่าไว้ใน URL)
  function update(next: Partial<TransactionFilterValues>) {
    const query = buildQuery({ ...filters, ...next });

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  // รอให้พิมพ์ค้นหาเสร็จก่อนค่อยโหลดใหม่ (ไม่ยิงทุกตัวอักษร)
  useEffect(() => {
    if (search.trim() === filters.q) return;

    const timer = setTimeout(() => {
      update({ q: search.trim() });
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const hasFilter =
    filters.q || filters.type !== "ALL" || filters.categoryId || filters.month;

  return (
    <div className="mt-8">
      <div className="grid gap-4 md:grid-cols-4">
        {/* ค้นหา */}
        <div className="md:col-span-2">
          <label className="label">ค้นหารายการ</label>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาจากรายละเอียด..."
            className="field"
          />
        </div>

        {/* ประเภท */}
        <div>
          <label className="label">ประเภท</label>

          <select
            value={filters.type}
            onChange={(e) =>
              update({
                type: e.target.value as TransactionFilterValues["type"],
              })
            }
            className="field"
          >
            <option value="ALL">ทั้งหมด</option>
            <option value="INCOME">รายรับ</option>
            <option value="EXPENSE">รายจ่าย</option>
          </select>
        </div>

        {/* หมวดหมู่ */}
        <div>
          <label className="label">หมวดหมู่</label>

          <select
            value={filters.categoryId}
            onChange={(e) => update({ categoryId: e.target.value })}
            className="field"
          >
            <option value="">ทุกหมวดหมู่</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* เดือน */}
        <div>
          <label className="label">เดือน</label>

          <input
            type="month"
            value={filters.month}
            onChange={(e) => update({ month: e.target.value })}
            className="field"
          />
        </div>
      </div>

      {hasFilter && (
        <button
          type="button"
          onClick={() => {
            setSearch("");
            router.replace(pathname, { scroll: false });
          }}
          className="mt-3 text-xs text-muted underline hover:text-ink"
        >
          ล้างตัวกรอง
        </button>
      )}
    </div>
  );
}
