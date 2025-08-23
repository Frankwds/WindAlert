"use client";

import { useState } from "react";

interface CollapsibleProps {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

export default function Collapsible({
  title,
  children,
  className = "",
  defaultOpen = false,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left p-4 focus:outline-none transition-all duration-200 cursor-pointer hover:shadow-sm relative group ${className}`}
        style={{
          '--tw-bg-opacity': '0.1',
        } as React.CSSProperties}
      >
        <div className="flex items-center w-full relative z-10">
          <div className="flex items-center flex-1">
            {title}
          </div>
          <div className="text-[var(--muted)] flex-shrink-0 ml-2">
            {isOpen ? "▼" : "▶"}
          </div>
        </div>
        <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-10 transition-opacity duration-200 pointer-events-none rounded-lg"></div>
      </button>
      {isOpen && <div className=" pb-4">{children}</div>}
    </div>
  );
}
