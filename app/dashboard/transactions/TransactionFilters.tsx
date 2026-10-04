"use client";

type Category = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
};

type TransactionFiltersProps = {
  search: string;
  setSearch: (value: string) => void;

  type: "ALL" | "INCOME" | "EXPENSE";
  setType: (value: "ALL" | "INCOME" | "EXPENSE") => void;

  categoryId: string;
  setCategoryId: (value: string) => void;

  month: string;
  setMonth: (value: string) => void;

  categories: Category[];
};

export default function TransactionFilters({
  search,
  setSearch,
  type,
  setType,
  categoryId,
  setCategoryId,
  month,
  setMonth,
  categories,
}: TransactionFiltersProps) {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-4">

      {/* ค้นหา */}
      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          ค้นหารายการ
        </label>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาจากรายละเอียด..."
          className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* ประเภท */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          ประเภท
        </label>

        <select
          value={type}
          onChange={(e) =>
            setType(
              e.target.value as
                | "ALL"
                | "INCOME"
                | "EXPENSE"
            )
          }
          className="w-full rounded-xl border px-4 py-3"
        >
          <option value="ALL">ทั้งหมด</option>
          <option value="INCOME">รายรับ</option>
          <option value="EXPENSE">รายจ่าย</option>
        </select>
      </div>

      {/* หมวดหมู่ */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          หมวดหมู่
        </label>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-xl border px-4 py-3"
        >
          <option value="">ทุกหมวดหมู่</option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* เดือน */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          เดือน
        </label>

        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full rounded-xl border px-4 py-3"
        />
      </div>

    </div>
  );
}