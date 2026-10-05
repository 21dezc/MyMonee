"use client";

type DeleteBudgetButtonProps = {
  id: string;
  onDeleted: () => void;
};

export default function DeleteBudgetButton({
  id,
  onDeleted,
}: DeleteBudgetButtonProps) {
  async function handleDelete() {
    const confirmed = window.confirm(
      "ต้องการลบงบประมาณนี้ใช่หรือไม่?"
    );

    if (!confirmed) {
      return;
    }

    const response = await fetch(
      `/api/budgets/${id}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(
        data.error ||
          "ไม่สามารถลบงบประมาณได้"
      );
      return;
    }

    onDeleted();
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