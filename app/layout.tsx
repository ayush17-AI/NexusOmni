import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
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
      <body className={`relative min-h-screen w-screen overflow-x-hidden ${montserrat.className}`}>
        <VideoBG />
        {children}
      </body>
    </html>
  );
}
