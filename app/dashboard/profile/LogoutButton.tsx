"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-xl border border-expense px-5 py-3 font-medium text-expense hover:bg-expense/10"
    >
      ออกจากระบบ
    </button>
  );
}