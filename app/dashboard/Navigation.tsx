"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/transactions", label: "รายการ" },
  { href: "/dashboard/add", label: "+ เพิ่มรายการ" },
  { href: "/dashboard/budget", label: "งบประมาณ" },
];

export default function Navigation() {
  const pathname = usePathname();
  const profileActive = pathname === "/dashboard/profile";

  return (
    <nav className="mb-10 flex items-center justify-between gap-3">
      <div className="flex-1" />

      <div className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-nav p-1">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors ${
                isActive
                  ? "bg-line text-ink"
                  : "text-muted hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-1 justify-end">
        <Link
          href="/dashboard/profile"
          aria-label="โปรไฟล์"
          className={`h-9 w-9 rounded-full border transition-colors ${
            profileActive
              ? "border-ink bg-nav"
              : "border-line bg-line hover:bg-nav"
          }`}
        />
      </div>
    </nav>
  );
}
