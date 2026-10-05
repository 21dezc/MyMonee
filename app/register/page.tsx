"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "สมัครสมาชิกไม่สำเร็จ");
        return;
      }

      window.location.href = "/login";
    } catch {
      setError("ไม่สามารถเชื่อมต่อ Server ได้");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper p-6">
      <div className="card w-full max-w-md p-8">
        <h1 className="mb-2 text-2xl font-semibold text-ink">
          สร้างบัญชี
        </h1>

        <p className="mb-6 text-muted">
          เริ่มต้นจัดการเงินของคุณกับ MyMonee
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="label">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="field"
              placeholder="กรอก Username"
              required
            />
          </div>

          <div>
            <label className="label">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
              placeholder="อย่างน้อย 6 ตัวอักษร"
              minLength={6}
              required
            />
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
            {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          มีบัญชีอยู่แล้ว?{" "}
          <a href="/login" className="font-medium text-ink underline">
            เข้าสู่ระบบ
          </a>
        </p>
      </div>
    </main>
  );
}