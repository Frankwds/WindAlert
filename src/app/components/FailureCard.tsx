"use client";

import { FailureReason } from "@/lib/openMeteo/types";

interface FailureCardProps {
  failures: FailureReason[];
}

export default function FailureCard({ failures }: FailureCardProps) {
  if (!failures || failures.length === 0) return null;

  return (
    <div className={`p-4`}>
      <h3 className="text-lg font-semibold mb-3 text-white">Failure Reasons</h3>
      <ul className="list-disc list-inside space-y-2">
        {failures.map((failure, index) => (
          <li key={index} className="text-red-200">
            {failure.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
