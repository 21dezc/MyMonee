"use client";

export default function DeleteButton({
  id,
}: {
  id: string;
}) {
  async function handleDelete() {
    const confirmed = window.confirm(
      "ต้องการลบรายการนี้ใช่หรือไม่?"
    );

    if (!confirmed) return;

    const response = await fetch(`/api/transactions/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "ลบรายการไม่สำเร็จ");
      return;
    }

    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="chip chip-expense"
    >
      ลบ
    </button>
  );
}