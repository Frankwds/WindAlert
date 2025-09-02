"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import LoginButton from './LoginButton';
import { useTheme } from '../contexts/ThemeContext';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/favourites', label: 'Favoritter' },
  { href: '/about', label: 'Om' },
  { href: '/contact', label: 'Kontakt' },
  { href: 'https://thermal.kk7.ch/', label: 'Thermal.kk', external: true },
  { href: 'https://rasp.skyltdirect.se/scandinavia/', label: 'RASP', external: true },
];

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="p-2 rounded-md transition-all duration-200 hover:bg-[var(--nav-text)]/10 text-[var(--nav-text)]/80 hover:text-[var(--nav-text)]"
        aria-label="Åpne meny"
        aria-expanded={isOpen}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 bg-[var(--nav-bg)] rounded-md shadow-lg z-20"
        >
          <ul className="py-1">
            {links.map(({ href, label, external }) => (
              <li key={href}>
                <Link
                  href={href}
                  target={external ? '_blank' : '_self'}
                  rel={external ? 'noopener noreferrer' : ''}
                  className={`block px-4 py-2 text-sm transition-all duration-200 ${
                    pathname === href
                      ? "bg-[var(--nav-text)]/10 text-[var(--nav-text)] font-medium"
                      : "text-[var(--nav-text)]/70 hover:bg-[var(--nav-text)]/10 hover:text-[var(--nav-text)]"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-[var(--nav-text)]/20 my-1"></div>
          <div className="px-4 py-2">
            <LoginButton />
          </div>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
