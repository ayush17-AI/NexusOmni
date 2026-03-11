import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexus Portal | Esports Intelligence",
  description: "Live BGMI, Free Fire & COD Mobile esports stats, players, and tournament data",
};

import VideoBG from "@/components/VideoBG";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="relative min-h-screen w-screen overflow-x-hidden">
        <VideoBG />
        {children}
      </body>
    </html>
  );
}
