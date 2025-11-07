'use client';

import React from 'react';

interface ButtonRejectProps {
  onClick: () => void;
  title: string;
  className?: string;
}

export const ButtonReject: React.FC<ButtonRejectProps> = ({ onClick, title, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-[var(--destructive)]/90 transition-colors font-medium ${className}`}
    >
      {title}
    </button>
  );
};
