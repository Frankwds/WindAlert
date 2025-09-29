import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../contexts/ThemeContext";
import ConditionalMain from "./ConditionalMain";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://windlord.no'),
  title: "WindLord",
  description: "Hvor kan jeg fly?",
  keywords: "paragliding, værmelding, Norge, flyvær, WindLord, Gwaihir, paragliding starter, vindmelding, værstasjoner, Finn hvor du kan fly, Paragliding starter, filtrer på vindretning, lovende vær, vindretning, værmelding, værstasjoner",
  authors: [{ name: "Frank Daniels" }],
  creator: "Frank Daniels",
  publisher: "WindLord",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "no_NO",
    url: "https://windlord.no",
    siteName: "WindLord",
    title: "WindLord - Paragliding Vær App",
    description: "Den beste appen for å finne paragliding starter i Norge. Se hvor du kan fly basert på været.",
    images: [
      {
        url: "/windlord.png",
        width: 1200,
        height: 630,
        alt: "WindLord - Paragliding Vær App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@windlord",
    creator: "@windlord",
    title: "WindLord - Paragliding Vær App",
    description: "Den beste appen for paragliding værmelding i Norge.",
    images: ["/windlord.png"],
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icon.png",
  },
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "https://windlord.no",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-[var(--background)] text-[var(--foreground)]`}
      >
        <AuthProvider>
          <ThemeProvider>
            <ConditionalMain>{children}</ConditionalMain>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
