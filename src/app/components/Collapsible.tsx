"use client";

import { useState } from 'react';

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function Collapsible({ title, children, className }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border border-gray-700 rounded-lg mb-2 ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 focus:outline-none"
      >
        <h2 className="text-xl font-semibold">{title}</h2>
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
}
