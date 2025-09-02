"use client";

import React from "react";

interface SectionModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const SectionModal: React.FC<SectionModalProps> = ({ title, onClose, children }) => {
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-bold">{title}</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-muted"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="overflow-y-auto h-full">{children}</div>
    </div>
  );
};

export default SectionModal;
