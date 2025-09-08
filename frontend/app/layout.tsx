import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LiquidEtherBackground } from "@/components/ui/liquid-ether"; // Add this line

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PortReviewer - AI-Powered Portfolio Analysis",
  description: "Get professional portfolio reviews with AI insights. Perfect for developers and recruiters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
  className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-900`}
>
        <LiquidEtherBackground /> {/* Add this line */}
        {children}
      </body>
    </html>
  );
}