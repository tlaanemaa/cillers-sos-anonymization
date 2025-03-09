import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from 'next/font/google';

// Initialize the Inter font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: "Redact AI | Intelligent Document Anonymization",
  description: "Enterprise-grade solution to detect and anonymize personally identifiable information in business documents",
  authors: [{ name: "Redact AI Team" }],
  keywords: ["document security", "data privacy", "GDPR compliance", "anonymization", "AI"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-slate-950 text-slate-200 min-h-screen flex flex-col antialiased">
        <main className="w-full mx-auto flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
