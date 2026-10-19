import Link from "next/link";
import { todayBangkok } from "@/lib/date";
import {
  formatThaiDate,
  monthlyEquivalent,
  relativeDays,
  type Frequency,
} from "@/lib/recurrence";

export type RecurringCardRule = {
  id: string;
  description: string | null;
  categoryName: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  frequency: Frequency;
  nextRunDate: Date;
};

function money(value: number) {
  return value.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// การ์ดสรุปรายการประจำบนแดชบอร์ด (rules = เฉพาะที่เปิดใช้งานและยังไม่ครบกำหนด เรียงตามครั้งถัดไป)
export default function RecurringCard({
  rules,
}: {
  rules: RecurringCardRule[];
}) {
  const today = todayBangkok();

  const monthly = (type: "INCOME" | "EXPENSE") =>
    rules
      .filter((rule) => rule.type === type)
      .reduce(
        (sum, rule) => sum + monthlyEquivalent(rule.amount, rule.frequency),
        0
      );

  const upcoming = rules.slice(0, 3);

  return (
    <section className="card mt-6 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">📌 รายการประจำ</h2>
          <p className="mt-1 text-xs text-muted">
            {rules.length > 0
              ? `เปิดใช้งานอยู่ ${rules.length} รายการ`
              : "ตั้งให้ระบบสร้างรายการซ้ำให้อัตโนมัติ เช่น ค่าเช่า ค่าเน็ต เงินเดือน"}
          </p>
        </div>

        <Link
          href="/dashboard/recurring"
          className="whitespace-nowrap text-sm text-muted hover:text-ink"
        >
          {rules.length > 0 ? "จัดการ →" : "+ เพิ่ม →"}
        </Link>
      </div>

      {rules.length === 0 ? (
        <p className="mt-4 text-xs text-faint">
          เคล็ดลับ: ที่หน้ารายการ กด &quot;ตั้งเป็นประจำ&quot;
          ที่รายการไหนก็ได้เพื่อปักหมุดเป็นรายการประจำ
        </p>
      ) : (
        <>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-line p-4">
              <p className="text-xs text-muted">รายรับประจำ / เดือน</p>
              <p className="mt-1 text-lg font-semibold text-income">
                ฿{money(monthly("INCOME"))}
              </p>
            </div>

            <div className="rounded-2xl bg-line p-4">
              <p className="text-xs text-muted">รายจ่ายประจำ / เดือน</p>
              <p className="mt-1 text-lg font-semibold text-expense">
                ฿{money(monthly("EXPENSE"))}
              </p>
            </div>
          </div>

          <p className="mt-5 text-xs text-muted">ครั้งถัดไป</p>

          <div className="mt-1">
            {upcoming.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-b-0"
              >
                <div>
                  <p className="text-sm">
                    {rule.description || rule.categoryName}
                  </p>
                  <p className="mt-0.5 text-xs text-faint">
                    {formatThaiDate(rule.nextRunDate)} ·{" "}
                    {relativeDays(rule.nextRunDate, today)}
                  </p>
                </div>

                <p
                  className={`text-sm font-medium ${
                    rule.type === "INCOME" ? "text-income" : "text-expense"
                  }`}
                >
                  {rule.type === "INCOME" ? "+" : "-"}฿{money(rule.amount)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
