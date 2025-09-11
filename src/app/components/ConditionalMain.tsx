"use client";

import { usePathname } from "next/navigation";
import Navigation from "./navigation";

interface ConditionalMainProps {
  children: React.ReactNode;
}

export default function ConditionalMain({ children }: ConditionalMainProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <div className="flex flex-col h-full">
      <Navigation />
      <main className={`flex-1 ${isHomePage ? "w-full" : "max-w-4xl mx-auto w-full"}`}>
        {children}
      </main>
    </div>
  );
}
