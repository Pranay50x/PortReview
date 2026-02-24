import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { LiquidEtherBackground } from "@/components/ui/liquid-ether"; // Add this line

const geistSans = localFont({
  src: "./fonts/GeistVF.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
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
    <html lang="en" data-scroll-behavior="smooth">
      <body
  className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-900`}
>
        <LiquidEtherBackground /> {/* Add this line */}
        {children}
      </body>
    </html>
  );
}