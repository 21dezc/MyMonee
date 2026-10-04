"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type ChartData = {
  month: string;
  income: number;
  expense: number;
};

type CategoryData = {
  name: string;
  value: number;
};

type DashboardChartsProps = {
  data: ChartData[];
  categoryData: CategoryData[];
};

export default function DashboardCharts({
  data,
  categoryData,
}: DashboardChartsProps) {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">

      {/* =========================
          กราฟรายรับ - รายจ่าย
      ========================= */}

      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="text-xl font-bold">
          รายรับ - รายจ่ายรายเดือน
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          เปรียบเทียบรายรับและรายจ่ายในแต่ละเดือน
        </p>

        <div className="mt-6 h-80">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip
                formatter={(value) =>
                  `฿${Number(value).toLocaleString("th-TH")}`
                }
              />

              <Legend />

              <Bar
                dataKey="income"
                name="รายรับ"
                fill="#22c55e"
                radius={[6, 6, 0, 0]}
              />

              <Bar
                dataKey="expense"
                name="รายจ่าย"
                fill="#ef4444"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* =========================
          กราฟสัดส่วนรายจ่าย
      ========================= */}

      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="text-xl font-bold">
          สัดส่วนรายจ่ายตามหมวดหมู่
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          ดูว่ารายจ่ายส่วนใหญ่หมดไปกับอะไร
        </p>

        {categoryData.length === 0 ? (
          <p className="py-32 text-center text-gray-400">
            ยังไม่มีข้อมูลรายจ่าย
          </p>
        ) : (
          <div className="mt-4 h-80">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={[
                        "#ef4444",
                        "#f97316",
                        "#eab308",
                        "#22c55e",
                        "#06b6d4",
                        "#3b82f6",
                        "#8b5cf6",
                        "#ec4899",
                      ][index % 8]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) =>
                    `฿${Number(value).toLocaleString("th-TH")}`
                  }
                />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

    </div>
  );
}