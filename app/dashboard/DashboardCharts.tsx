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
    <div className="mt-10 grid gap-8 lg:grid-cols-2">

      {/* =========================
          กราฟรายรับ - รายจ่าย
      ========================= */}

      <div className="px-1">
        <h2 className="text-lg font-semibold">
          รายรับ - รายจ่ายรายเดือน
        </h2>

        <p className="mt-1 text-xs text-muted">
          เปรียบเทียบรายรับและรายจ่ายในแต่ละเดือน
        </p>

        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid
                stroke="var(--color-line)"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                tick={{
                  fill: "var(--color-muted)",
                  fontSize: 12,
                }}
                axisLine={{
                  stroke: "var(--color-nav)",
                }}
                tickLine={false}
              />

              <YAxis
                tick={{
                  fill: "var(--color-muted)",
                  fontSize: 12,
                }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                cursor={{
                  fill: "var(--color-line)",
                }}
                contentStyle={{
                  background: "var(--color-paper)",
                  border: "1px solid var(--color-nav)",
                  borderRadius: 12,
                  color: "var(--color-ink)",
                }}
                labelStyle={{
                  color: "var(--color-ink)",
                }}
                itemStyle={{
                  color: "var(--color-ink)",
                }}
                formatter={(value) =>
                  `฿${Number(value).toLocaleString("th-TH")}`
                }
              />

              <Legend
                wrapperStyle={{
                  color: "var(--color-muted)",
                  fontSize: 12,
                }}
              />

              <Bar
                dataKey="income"
                name="รายรับ"
                fill="#9dd573"
                radius={[6, 6, 0, 0]}
              />

              <Bar
                dataKey="expense"
                name="รายจ่าย"
                fill="#d36f6f"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* =========================
          กราฟสัดส่วนรายจ่าย
      ========================= */}

      <div className="px-1">
        <h2 className="text-lg font-semibold">
          สัดส่วนรายจ่ายตามหมวดหมู่
        </h2>

        <p className="mt-1 text-xs text-muted">
          ดูว่ารายจ่ายส่วนใหญ่หมดไปกับอะไร
        </p>

        {categoryData.length === 0 ? (
          <p className="py-32 text-center text-faint">
            ยังไม่มีข้อมูลรายจ่าย
          </p>
        ) : (
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={{
                    fill: "var(--color-muted)",
                    fontSize: 12,
                  }}
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={[
                        "#d36f6f",
                        "#73a7d5",
                        "#9dd573",
                        "#e0a96d",
                        "#a98fd0",
                        "#6fc0b8",
                        "#d58fb4",
                        "#b6b6b2",
                      ][index % 8]}
                      stroke="var(--color-paper)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    background: "var(--color-paper)",
                    border: "1px solid var(--color-nav)",
                    borderRadius: 12,
                    color: "var(--color-ink)",
                  }}
                  labelStyle={{
                    color: "var(--color-ink)",
                  }}
                  itemStyle={{
                    color: "var(--color-ink)",
                  }}
                  formatter={(value) =>
                    `฿${Number(value).toLocaleString("th-TH")}`
                  }
                />

                <Legend
                  wrapperStyle={{
                    color: "var(--color-muted)",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

    </div>
  );
}