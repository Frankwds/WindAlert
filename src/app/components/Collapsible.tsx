"use client";

import { useState } from "react";
import styles from "./Collapsible.module.css";

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
        className={`w-full text-left p-4 focus:outline-none transition-all duration-200 cursor-pointer hover:shadow-sm ${styles.collapsibleButton} ${className}`}
      >
        <div className={`flex items-center w-full ${styles.collapsibleContent}`}>
          <div className="flex items-center flex-1">
            {title}
          </div>
          <div className="text-[var(--muted)] flex-shrink-0 ml-2">
            {isOpen ? "▼" : "▶"}
          </div>
        </div>

      </button>
      {isOpen && <div className=" pb-4">{children}</div>}
    </div>
  );
}
