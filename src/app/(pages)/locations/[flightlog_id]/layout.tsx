import { locationMetadata } from "./metadata";

// ISR: Revalidate every hour for caching
export const revalidate = 3600;

export const metadata = locationMetadata;

export default function LocationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
