'use client';

export default function ValidationList({ failuresCsv, WarningsCsv }: { failuresCsv: string; WarningsCsv: string }) {
  const failureList = failuresCsv ? failuresCsv.split(',') : [];
  const warningList = WarningsCsv ? WarningsCsv.split(',') : [];
  return (
    <div>
      <ul className='list-disc list-inside space-y-2'>
        {failureList.length > 0 &&
          failureList.map((failure, index) => (
            <li key={index} className={'text-[var(--error)]'}>
              {failure}
            </li>
          ))}
        {warningList.length > 0 &&
          warningList.map((warning, index) => (
            <li key={index} className={'text-[var(--warning)]'}>
              {warning}
            </li>
          ))}
      </ul>
    </div>
  );
}
