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
  title: "CaraCarriers — All-in-One Freight Broker TMS Platform",
  description:
    "CaraCarriers is the complete transportation management system built for freight brokers. Manage loads, carriers, shippers, dispatch, invoicing, documents, and compliance — all in one platform. Replace McLeod, DAT, and Truckstop with a single solution.",
  keywords: [
    "freight broker TMS", "transportation management system", "load board software",
    "freight dispatch software", "carrier management", "trucking broker platform",
    "freight brokerage software", "DOT compliance", "freight invoicing", "CaraCarriers",
  ],
  authors: [{ name: "CaraCarriers" }],
  openGraph: {
    title: "CaraCarriers — All-in-One Freight Broker TMS",
    description: "The complete platform for freight brokers. Load management, carrier vetting, invoicing, e-signatures, and compliance — all in one place.",
    type: "website",
    siteName: "CaraCarriers",
  },
  twitter: {
    card: "summary_large_image",
    title: "CaraCarriers — All-in-One Freight Broker TMS",
    description: "Replace your stack with one platform built for freight brokers.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
