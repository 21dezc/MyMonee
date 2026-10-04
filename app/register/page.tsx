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
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          สร้างบัญชี
        </h1>

        <p className="mb-6 text-gray-500">
          เริ่มต้นจัดการเงินของคุณกับ MyMonee
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
              placeholder="กรอก Username"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
              placeholder="อย่างน้อย 6 ตัวอักษร"
              minLength={6}
              required
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black py-3 font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          มีบัญชีอยู่แล้ว?{" "}
          <a href="/login" className="font-medium text-black underline">
            เข้าสู่ระบบ
          </a>
        </p>
      </div>
    </main>
  );
}