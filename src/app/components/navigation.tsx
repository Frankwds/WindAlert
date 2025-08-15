"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import LoginButton from "./LoginButton";

const links = [
  { href: "/alerts", label: "Alerts" },
  { href: "/locations", label: "Locations" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="px-4 bg-gray-800 text-white">
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center">
          <div className="mr-4">
            <Image
              src="/windlord-dark.png"
              alt="WindLord Logo"
              width={64}
              height={64}
            />
          </div>
          <ul className="flex space-x-4">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={pathname === href ? "underline" : ""}
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
