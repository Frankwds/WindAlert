'use client';

import React from 'react';

interface ButtonAcceptProps {
  onClick: () => void;
  title: string;
  className?: string;
  isMobile?: boolean;
  disabled?: boolean;
}

export const ButtonAccept: React.FC<ButtonAcceptProps> = ({
  onClick,
  title,
  className = '',
  isMobile = false,
  disabled = false
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-md font-medium ${disabled
        ? 'bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed'
        : `bg-blue-600 text-white shadow cursor-pointer ${!isMobile ? 'hover:bg-blue-700' : ''}`
        } ${className}`}
    >
      {title}
    </button>
  );
};
