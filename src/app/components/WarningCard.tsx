"use client";

import { WarningReason } from "@/lib/openMeteo/types";

interface WarningCardProps {
  warnings: WarningReason[];
}

export default function WarningCard({ warnings }: WarningCardProps) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-[var(--foreground)]">Warnings</h3>
      <ul className="list-disc list-inside space-y-2">
        {warnings.map((warning, index) => (
          <li key={index} className="text-[var(--warning)]">
            {warning.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
