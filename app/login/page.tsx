"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });


    console.log("LOGIN RESULT:", result);

    setLoading(false);

    if (result?.error) {
      setError("Username หรือ Password ไม่ถูกต้อง");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          ยินดีต้อนรับกลับ
        </h1>

        <p className="mb-6 text-gray-500">
          เข้าสู่ระบบ MyMonee
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
            required
          />

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
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-400">หรือ</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          className="w-full rounded-xl border py-3 font-medium hover:bg-gray-50"
        >
          Continue with GitHub
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          ยังไม่มีบัญชี?{" "}
          <a href="/register" className="font-medium text-black underline">
            สมัครสมาชิก
          </a>
        </p>
      </div>
    </main>
  );
}