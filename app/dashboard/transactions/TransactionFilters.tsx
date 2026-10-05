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
    <div className="mt-8 grid gap-4 md:grid-cols-4">

      {/* ค้นหา */}
      <div className="md:col-span-2">
        <label className="label">
          ค้นหารายการ
        </label>

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
        <label className="label">
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
          className="field"
        >
          <option value="ALL">ทั้งหมด</option>
          <option value="INCOME">รายรับ</option>
          <option value="EXPENSE">รายจ่าย</option>
        </select>
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
        <label className="label">
          เดือน
        </label>

        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="field"
        />
      </div>

    </div>
  );
}