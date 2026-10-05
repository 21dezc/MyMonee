"use client";

import { useState } from "react";

type EditEmailButtonProps = {
  currentEmail: string;
};

export default function EditEmailButton({
  currentEmail,
}: EditEmailButtonProps) {
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(currentEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setError("");

    if (!email.trim()) {
      setError("กรุณากรอกอีเมล");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "เกิดข้อผิดพลาด");
        return;
      }

      setEditing(false);
      window.location.reload();
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-full border border-line px-4 py-1.5 text-sm transition-colors hover:bg-line"
      >
        {currentEmail ? "แก้ไข" : "เพิ่มอีเมล"}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
          className="w-52 rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
          autoFocus
        />

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="rounded-full bg-ink px-4 py-1.5 text-sm text-paper disabled:opacity-50"
        >
          {loading ? "กำลังบันทึก..." : "บันทึก"}
        </button>

        <button
          type="button"
          onClick={() => {
            setEmail(currentEmail);
            setError("");
            setEditing(false);
          }}
          className="rounded-full border border-line px-4 py-1.5 text-sm hover:bg-line"
        >
          ยกเลิก
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}