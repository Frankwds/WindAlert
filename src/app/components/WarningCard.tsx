"use client";

export default function WarningCard({ warningsCsv }: { warningsCsv: string }) {
  if (!warningsCsv || warningsCsv.length === 0) return null;

  const warningList = warningsCsv.split(',');

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-[var(--foreground)]">Advarsler</h3>
      <ul className="list-disc list-inside space-y-2">
        {warningList.map((warning, index) => (
          <li key={index} className="text-[var(--warning)]">
            {warning}
          </li>
        ))}
      </ul>
    </div>
  );
}
