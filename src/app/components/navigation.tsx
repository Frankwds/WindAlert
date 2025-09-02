"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import LoginButton from "./LoginButton";
import { useRouter } from "next/navigation";
import { useTheme } from "../contexts/ThemeContext";

const links = [
  { href: "/favourites", label: "Favoritter" },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  return (
    <nav className="px-4 bg-[var(--nav-bg)] text-[var(--nav-text)] shadow-[var(--shadow-md)]">
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center">
          <div className="mr-6">
            <Image
              key={theme}
              src={theme === 'light' ? "/windlord-semi-dark.png" : "/windlord-dark.png"}
              alt="WindLord Logo"
              width={64}
              height={64}
              priority
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
                    ? "bg-[var(--nav-text)]/10 text-[var(--nav-text)] font-medium"
                    : "text-[var(--nav-text)]/50 hover:text-[var(--nav-text)]"
                    }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md transition-all duration-200 hover:bg-[var(--nav-text)]/10 text-[var(--nav-text)]/80 hover:text-[var(--nav-text)]"
            aria-label={`Bytt til ${theme === 'light' ? 'dark' : 'light'} modus`}
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
          <LoginButton />
        </div>
      </div>
    </nav>
  );
}
