import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from 'next/font/google';

// Initialize the Inter font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Document Anonymizer",
  description: "Tool to detect and anonymize personally identifiable information in text documents",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-slate-950 text-slate-200 min-h-screen flex flex-col">
        <main className="w-full mx-auto flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
