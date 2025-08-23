"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import LoginButton from "./LoginButton";
import { useRouter } from "next/navigation";

const links = [
  { href: "/alerts", label: "Alerts" },
  { href: "/locations", label: "Locations" },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <nav className="px-4 bg-[var(--nav-bg)] text-[var(--nav-text)] shadow-[var(--shadow-md)]">
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center">
          <div className="mr-6">
            <Image
              src="/windlord-dark.png"
              alt="WindLord Logo"
              width={64}
              height={64}
              className="transition-transform hover:scale-105 cursor-pointer"
              onClick={() => router.push("/")}
            />
          </div>
          <ul className="flex space-x-6">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`px-3 py-2 rounded-md transition-all duration-200 hover:bg-[var(--nav-text)]/10 ${pathname === href
                    ? "bg-[var(--nav-text)]/30 text-[var(--nav-text)] font-medium"
                    : "text-[var(--nav-text)]/50 hover:text-[var(--nav-text)]"
                    }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <LoginButton />
        </div>
      </div>
    </nav>
  );
}
