"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/alerts", label: "Alerts" },
  { href: "/locations", label: "Locations" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="p-4 bg-gray-800 text-white">
      <ul className="flex space-x-4">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} className={pathname === href ? "underline" : ""}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
