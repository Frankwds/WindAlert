"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import LoginButton from './LoginButton';
import { useTheme } from '../contexts/ThemeContext';
import { usePathname } from 'next/navigation';

interface LinkItem {
  href: string;
  label: string;
  external?: boolean;
}

interface HamburgerMenuProps {
  links: LinkItem[];
}

const HamburgerMenu = ({ links }: HamburgerMenuProps) => {
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
        className="p-2 rounded-md transition-all duration-200text-[var(--nav-text)]/80 cursor-pointer"
        aria-label="Åpne meny"
        aria-expanded={isOpen}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
        </svg>
      </button>

      <div
        className={`absolute right-0 mt-2 w-64 bg-[var(--nav-bg)] rounded-md border border-[var(--nav-text)]/20 shadow-xl z-20 transition-all duration-300 ease-in-out transform origin-top-right ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
      >
        <ul className="py-1">
          {links.map(({ href, label, external }) => (
            <li key={href}>
              <Link
                href={href}
                target={external ? '_blank' : '_self'}
                rel={external ? 'noopener noreferrer' : ''}
                className={`block px-4 py-2 text-sm transition-all duration-200 flex items-center ${pathname === href
                  ? "bg-[var(--nav-text)]/10 text-[var(--nav-text)] font-medium"
                  : "text-[var(--nav-text)]/70 hover:bg-[var(--nav-text)]/10 hover:text-[var(--nav-text)]"
                  }`}
                onClick={() => setIsOpen(false)}
              >
                <span>{label}</span>
                {external && (
                  <svg className="w-3 h-3 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                )}
              </Link>
            </li>
          ))}
        </ul>
        <div className="border-t border-[var(--nav-text)]/20 my-1"></div>
        <div className="px-1 py-1">
          <LoginButton />
        </div>
      </div>
    </div>
  );
};

export default HamburgerMenu;
