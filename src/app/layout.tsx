import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tour Guide",
  description: "Band merchandise and tour management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
