"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    {
      href: "/dashboard",
      label: "🏠 Dashboard",
    },
    {
      href: "/dashboard/transactions",
      label: "📝 รายการ",
    },
    {
      href: "/dashboard/add",
      label: "＋ เพิ่มรายการ",
    },
    {
      href: "/dashboard/budget",
      label: "🎯 งบประมาณ",
    },
    {
      href: "/dashboard/profile",
      label: "👤 โปรไฟล์",
    },
  ];

  return (
    <nav className="mb-8 rounded-[28px] border border-[#252525] bg-[#0d0d0d] p-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:flex md:flex-wrap">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-[20px] px-4 py-3 text-center text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-white text-black"
                  : "text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}