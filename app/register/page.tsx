"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const usernameRules = [
    {
      ok: username.length >= 3 && username.length <= 30,
      text: "3–30 ตัวอักษร",
    },
    {
      ok: /^[a-zA-Z]/.test(username),
      text: "ขึ้นต้นด้วยตัวอักษรภาษาอังกฤษ",
    },
  ];

  const passwordRules = [
    { ok: password.length >= 6, text: "อย่างน้อย 6 ตัวอักษร" },
  ];

  // มีตัวอักษรที่ไม่ใช่ภาษาอังกฤษ/ตัวเลข/สัญลักษณ์
  // เช่น ภาษาไทย หรือเว้นวรรค
  const passwordHasInvalidChar = /[^\x21-\x7E]/.test(password);

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const canSubmit =
    usernameRules.every((r) => r.ok) &&
    passwordRules.every((r) => r.ok) &&
    !passwordHasInvalidChar &&
    passwordsMatch;

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (!canSubmit) {
      setError("กรุณากรอกข้อมูลให้ตรงตามเงื่อนไข");
      return;
    }

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
              onChange={(e) =>
                setUsername(
                  e.target.value.replace(/[^a-zA-Z0-9\_-]/g, "")
                )
              }
              className="field"
              placeholder="เช่น mymonee_01"
              required
            />

            <ul className="mt-2 space-y-1 text-xs">
              {usernameRules.map((r) => (
                <li
                  key={r.text}
                  className={r.ok ? "text-income" : "text-muted"}
                >
                  {r.ok ? "✓" : "○"} {r.text}
                </li>
              ))}
            </ul>
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

            <ul className="mt-2 space-y-1 text-xs">
              {passwordRules.map((r) => (
                <li
                  key={r.text}
                  className={r.ok ? "text-income" : "text-muted"}
                >
                  {r.ok ? "✓" : "○"} {r.text}
                </li>
              ))}
            </ul>

            {passwordHasInvalidChar && (
              <p className="mt-2 text-xs text-expense">
                รหัสผ่านต้องเป็นภาษาอังกฤษเท่านั้น (ตัวเลขและสัญลักษณ์ใช้ได้ ห้ามเว้นวรรค)
              </p>
            )}
          </div>

          <div>
            <label className="label">
              ยืนยัน Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="field"
              placeholder="กรอก Password อีกครั้ง"
              required
            />

            {confirmPassword.length > 0 && (
              <p
                className={`mt-2 text-xs ${
                  passwordsMatch ? "text-income" : "text-expense"
                }`}
              >
                {passwordsMatch
                  ? "✓ รหัสผ่านตรงกัน"
                  : "✗ รหัสผ่านไม่ตรงกัน"}
              </p>
            )}
          </div>

          {error && (
            <p className="rounded-xl bg-expense/10 p-3 text-sm text-expense">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !canSubmit}
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