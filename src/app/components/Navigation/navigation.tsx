"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import HamburgerMenu from "./HamburgerMenu";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useState } from "react";

const links = [
  { href: "/", label: "Hovedstarter", description: " - I Norge" },
  { href: "/locations/all", label: "Alle starter" },
  { href: "/favourites", label: "Favoritter" },
  { href: "/about", label: "Om" },
  { href: '/contact', label: 'Kontakt' },
  { href: 'https://luftrom.info/viewer', label: 'Luftrom.info', description: " - Sjekk før du flyr!!", external: true },
  { href: 'https://thermal.kk7.ch/#64.2,17,4', label: 'Thermal.kk7', description: " - Takk for skyways<3", external: true },
];

export default function Navigation() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const [isFlying, setIsFlying] = useState(false);

  return (
    <nav className="px-4 bg-[var(--nav-bg)] text-[var(--nav-text)] shadow-[var(--shadow-md)]">
      <div className="flex items-center justify-between py-3 max-w-4xl mx-auto">
        <div className="flex items-center">
          <div className={`mr-6 flex items-center cursor-pointer group`}
            onClick={() => {
              setIsFlying(true);
              setTimeout(() => setIsFlying(false), 400);
              router.push("/");
            }}>
            <Image
              key={theme}
              src={theme === 'light' ? "/windlord-semi-dark.png" : "/windlord-dark.png"}
              alt="WindLord Logo"
              width={64}
              height={64}
              priority
              className={`transition-transform group-hover:scale-115 select-none ${isFlying ? 'animate-fly' : ''}`}

            />
            <h1
              className="ml-3 text-2xl font-bold text-[var(--nav-text)] select-none">
              WindLord
            </h1>
          </div>

        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className={`cursor-pointer p-2 rounded-md transition-all duration-200 text-[var(--nav-text)]/80 ${!isMobile ? 'hover:bg-[var(--nav-text)]/10' : ''}`}
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
          <HamburgerMenu links={links} />
        </div>
      </div>
    </nav>
  );
}
