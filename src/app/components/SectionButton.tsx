"use client";

import React from "react";

interface SectionButtonProps {
  title: string;
  onClick: () => void;
}

const SectionButton: React.FC<SectionButtonProps> = ({ title, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full my-2 p-4 bg-muted text-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow"
    >
      {title}
    </button>
  );
};

export default SectionButton;
