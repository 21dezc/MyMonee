"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/transactions", label: "รายการ" },
  { href: "/dashboard/add", label: "+ เพิ่มรายการ" },
  { href: "/dashboard/budget", label: "งบประมาณ" },
];

type NavigationProps = {
  user?: {
    name?: string | null;
    image?: string | null;
  };
};

export default function Navigation({ user }: NavigationProps) {
  const pathname = usePathname();
  const profileActive = pathname === "/dashboard/profile";

  return (
    <nav className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex justify-center sm:flex-1" />

      <div className="flex w-full justify-center sm:w-auto">
        <div className="flex max-w-full flex-wrap justify-center gap-1 rounded-full border border-nav p-1">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs transition-colors sm:px-4 sm:text-sm ${
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
      </div>

      <div className="flex items-center justify-center gap-2 sm:fl
      ex-1 sm:justify-end">
        <ThemeToggle />
        <Link
          href="/dashboard/profile"
          aria-label="โปรไฟล์"
          className={`flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border transition-colors ${
            profileActive
              ? "border-ink bg-nav"
              : "border-line bg-line hover:bg-nav"
          }`}
        >
          {user?.image ? (
            <img
              src={user.image}
              alt={user.name || "Profile"}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-muted">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}