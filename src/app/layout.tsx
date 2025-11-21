import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tour Guide - Band Merchandise & Tour Management",
  description: "Ultimate tool for band tour managers. Track merchandise, manage inventory, and monitor sales across every show.",
  keywords: "band management, tour merchandise, inventory tracking, sales analytics",
  openGraph: {
    title: "Tour Guide - Band Merchandise & Tour Management",
    description: "Track merchandise, manage inventory, and monitor sales across every show.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tour Guide",
    description: "Ultimate tool for band tour managers",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
      </head>
      <body style={{
        minHeight: '100vh',
        fontFamily: 'system-ui, sans-serif',
        backgroundColor: '#0a0a0f',
        color: '#f0f0f5'
      }}>
        {children}
      </body>
    </html>
  );
}
