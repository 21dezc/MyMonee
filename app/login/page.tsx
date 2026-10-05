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
    <main className="flex min-h-screen items-center justify-center bg-paper p-6">
      <div className="card w-full max-w-md p-8">
        <h1 className="mb-2 text-2xl font-semibold text-ink">
          ยินดีต้อนรับกลับ
        </h1>

        <p className="mb-6 text-muted">
          เข้าสู่ระบบ MyMonee
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="field"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="field"
            required
          />

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
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <span className="text-sm text-faint">หรือ</span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <button
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          className="btn-ghost w-full"
        >
          Continue with GitHub
        </button>

        <p className="mt-6 text-center text-sm text-muted">
          ยังไม่มีบัญชี?{" "}
          <a href="/register" className="font-medium text-ink underline">
            สมัครสมาชิก
          </a>
        </p>
      </div>
    </main>
  );
}