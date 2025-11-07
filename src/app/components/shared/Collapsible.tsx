'use client';

import { useState } from 'react';

interface CollapsibleProps {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function Collapsible({
  title,
  children,
  className = '',
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
}: CollapsibleProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);

  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = onToggle || setInternalIsOpen;

  return (
    <div className='rounded-lg'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left p-4 focus:outline-none cursor-pointer hover:shadow-[var(--shadow-sm)] hover:brightness-95 relative group ${className}`}
      >
        <div className='flex items-center w-full relative z-10'>
          <div className='flex items-center flex-1'>{title}</div>
          <div className='text-[var(--muted)] flex-shrink-0 ml-2'>{isOpen ? '▼' : '▶'}</div>
        </div>
        <div className='absolute inset-0 bg-current opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none rounded-lg'></div>
      </button>
      {isOpen && <div className='px-1 pb-4'>{children}</div>}
    </div>
  );
}
