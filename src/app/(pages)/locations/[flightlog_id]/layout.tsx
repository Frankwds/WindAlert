import { generateLocationMetadata } from './metadata';
import type { Metadata } from 'next';

// ISR: Revalidate every 30 days for caching
export const revalidate = 2592000;

export async function generateMetadata({ params }: { params: Promise<{ flightlog_id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  return generateLocationMetadata(resolvedParams.flightlog_id);
}

export default function LocationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
