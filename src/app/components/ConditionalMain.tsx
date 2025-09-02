"use client";

import { usePathname } from "next/navigation";

interface ConditionalMainProps {
  children: React.ReactNode;
}

export default function ConditionalMain({ children }: ConditionalMainProps) {
  const pathname = usePathname();

  // Apply centering to all pages except the home page
  const isHomePage = pathname === "/";

  return (
    <main className={`flex-1 ${isHomePage ? "w-full" : "max-w-4xl mx-auto w-full"}`}>
      {children}
    </main>
  );
}
