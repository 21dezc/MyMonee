"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RecurringActions({
  id,
  active,
  finished = false,
}: {
  id: string;
  active: boolean;
  finished?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);

    try {
      const response = await fetch(`/api/recurring/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "อัปเดตไม่สำเร็จ");
        return;
      }

      router.refresh();
    } catch {
      alert("ไม่สามารถเชื่อมต่อ Server ได้");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    const confirmed = window.confirm(
      "ต้องการลบรายการประจำนี้ใช่หรือไม่?\n(รายการที่สร้างไปแล้วจะไม่ถูกลบ)"
    );

    if (!confirmed) return;

    setBusy(true);

    try {
      const response = await fetch(`/api/recurring/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "ลบไม่สำเร็จ");
        return;
      }

      router.refresh();
    } catch {
      alert("ไม่สามารถเชื่อมต่อ Server ได้");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* รายการที่ครบกำหนดแล้วเปิดใหม่ไม่ได้ จึงไม่แสดงปุ่มเปิด/ปิด */}
      {!finished && (
        <button
          type="button"
          onClick={toggle}
          disabled={busy}
          className="chip chip-info disabled:opacity-50"
        >
          {active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
        </button>
      )}

      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className="chip chip-expense disabled:opacity-50"
      >
        ลบ
      </button>
    </div>
  );
}
