import { contributeMetadata } from './metadata';

export const metadata = contributeMetadata;

export default function ContributeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
