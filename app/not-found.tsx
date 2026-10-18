import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper p-6">
      <div className="card w-full max-w-md p-8 text-center">
        <p className="text-5xl font-semibold text-faint">404</p>

        <h1 className="mt-4 text-xl font-semibold">ไม่พบหน้าที่ต้องการ</h1>

        <p className="mt-2 text-sm text-muted">
          หน้านี้อาจถูกลบหรือพิมพ์ที่อยู่ผิด
        </p>

        <Link href="/dashboard" className="btn-primary mt-6">
          กลับหน้าหลัก
        </Link>
      </div>
    </main>
  );
}
