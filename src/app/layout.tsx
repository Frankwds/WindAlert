import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import Navigation from "./components/navigation";
import Provider from "./components/Provider";
import { ThemeProvider } from "./contexts/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WindLord",
  description: "Your paragliding weather companion.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-[var(--background)] text-[var(--foreground)]`}
      >
        <Provider>
          <ThemeProvider>
            <div className="flex flex-col h-full">
              <Navigation />
              <main className="flex-1">{children}</main>
            </div>
          </ThemeProvider>
        </Provider>
      </body>
    </html>
  );
}
