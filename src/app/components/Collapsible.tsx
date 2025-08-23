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
    <div className="border border-gray-700 rounded-lg mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left p-4 hover:bg-gray-700 focus:outline-none ${className} ${isOpen ? "rounded-t-lg" : "rounded-lg"
          }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {title}
          </div>
          <div className="text-gray-400">
            {isOpen ? "▼" : "▶"}
          </div>
        </div>

      </button>
      {isOpen && <div className="bg-gray-800 rounded-b-lg">{children}</div>}
    </div>
  );
}
