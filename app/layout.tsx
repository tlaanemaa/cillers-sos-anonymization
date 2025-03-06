import "./globals.css";
import type { Metadata, Viewport } from "next";

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
    <html lang="en">
      <body className="bg-slate-900 text-slate-200 min-h-screen">
        <main className="w-full mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
