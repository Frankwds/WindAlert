"use client";

import { FailureReason } from "@/lib/openMeteo/types";

interface FailureCardProps {
  failures: FailureReason[];
}

export default function FailureCard({ failures }: FailureCardProps) {
  if (!failures || failures.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-[var(--foreground)]">Failure Reasons</h3>
      <ul className="list-disc list-inside space-y-2">
        {failures.map((failure, index) => (
          <li key={index} className="text-[var(--error)]">
            {failure.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
