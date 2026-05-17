import type { Metadata } from "next";
import { DM_Sans, Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AnemoneWidget from "@/components/anemone/AnemoneWidget";
import RootProviders from "@/components/RootProviders";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "YAA Store — Anime Merch & Fandom",
  description:
    "Premium anime merchandise, exclusive drops, and fandom community — powered by Anemone AI.",
  keywords: ["anime", "merch", "figures", "manga", "streetwear", "fandom"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${syne.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <RootProviders>
          {children}
          <AnemoneWidget />
        </RootProviders>
      </body>
    </html>
  );
}
