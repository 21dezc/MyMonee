"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-xl bg-red-500 px-5 py-3 font-medium text-white hover:bg-red-600"
    >
      ออกจากระบบ
    </button>
  );
}