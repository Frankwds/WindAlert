'use client';

import React from 'react';

interface ButtonNeutralProps {
  onClick: () => void;
  title: string;
  className?: string;
  isMobile?: boolean;
}

export const ButtonNeutral: React.FC<ButtonNeutralProps> = ({
  onClick,
  title,
  className = '',
  isMobile = false
}) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] cursor-pointer font-medium ${!isMobile ? 'hover:bg-black/5 dark:hover:bg-white/10' : ''} ${className}`}
    >
      {title}
    </button>
  );
};
