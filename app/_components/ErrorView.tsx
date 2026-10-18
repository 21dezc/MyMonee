"use client";

import { useEffect } from "react";
import Link from "next/link";

type ErrorViewProps = {
  error: Error & { digest?: string };
  reset: () => void;
  // true = แสดงเต็มจอ (นอก dashboard)
  fullScreen?: boolean;
};

export default function ErrorView({
  error,
  reset,
  fullScreen = false,
}: ErrorViewProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      className={`flex items-center justify-center p-6 ${
        fullScreen ? "min-h-screen" : "py-16"
      }`}
    >
      <div className="card w-full max-w-md p-8 text-center">
        <p className="text-4xl">😵</p>

        <h1 className="mt-4 text-xl font-semibold">เกิดข้อผิดพลาดบางอย่าง</h1>

        <p className="mt-2 text-sm text-muted">
          ขออภัย ระบบมีปัญหาชั่วคราว ลองใหม่อีกครั้ง
          ถ้ายังไม่หายให้กลับไปหน้าหลักก่อน
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={reset} className="btn-primary">
            ลองใหม่
          </button>

          <Link href="/dashboard" className="btn-ghost">
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </main>
  );
}
