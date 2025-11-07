'use client';

import { usePathname } from 'next/navigation';
import Navigation from './components/Navigation/navigation';

interface ConditionalMainProps {
  children: React.ReactNode;
}

export default function ConditionalMain({ children }: ConditionalMainProps) {
  const pathname = usePathname();
  const isMapPage = pathname === '/' || pathname === '/locations/all';
  return (
    <div className='flex flex-col h-full w-full'>
      <Navigation />
      <main className={`${isMapPage ? 'w-full h-full' : 'max-w-4xl mx-auto w-full'}`}>{children}</main>
    </div>
  );
}
