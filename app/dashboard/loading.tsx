// แสดงทันทีระหว่างรอข้อมูลของหน้าใน dashboard (กดเมนูแล้วไม่ค้างหน้าเดิม)
export default function Loading() {
  return (
    <main className="animate-pulse" aria-busy="true" aria-label="กำลังโหลด">
      <div className="h-7 w-48 rounded-xl bg-line" />
      <div className="mt-3 h-4 w-64 rounded-xl bg-line" />

      <div className="mt-8 grid gap-3 md:grid-cols-3">
        <div className="h-24 rounded-3xl bg-line" />
        <div className="h-24 rounded-3xl bg-line" />
        <div className="h-24 rounded-3xl bg-line" />
      </div>

      <div className="mt-8 h-56 rounded-3xl bg-line" />
    </main>
  );
}
