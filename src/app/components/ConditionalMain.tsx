"use client";

import { usePathname } from "next/navigation";
import { useFullscreen } from "../contexts/FullscreenContext";
import Navigation from "./navigation";

interface ConditionalMainProps {
  children: React.ReactNode;
}

export default function ConditionalMain({ children }: ConditionalMainProps) {
  const pathname = usePathname();
  const { isFullscreen } = useFullscreen();

  // Apply centering to all pages except the home page
  const isHomePage = pathname === "/";
  const shouldHideNavigation = isHomePage && isFullscreen;

  return (
    <div className="flex flex-col h-full">
      {!shouldHideNavigation && <Navigation />}
      <main className={`flex-1 ${isHomePage ? "w-full" : "max-w-4xl mx-auto w-full"}`}>
        {children}
      </main>
    </div>
  );
}
