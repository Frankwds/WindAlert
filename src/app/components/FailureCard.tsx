"use client";

export default function FailureCard({ failuresCsv }: { failuresCsv: string }) {
  if (!failuresCsv || failuresCsv.length === 0) return null;

  const failureList = failuresCsv.split(',');

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-[var(--foreground)]">Årsaker til feil</h3>
      <ul className="list-disc list-inside space-y-2">
        {failureList.map((failure, index) => (
          <li key={index} className="text-[var(--error)]">
            {failure}
          </li>
        ))}
      </ul>
    </div>
  );
}
