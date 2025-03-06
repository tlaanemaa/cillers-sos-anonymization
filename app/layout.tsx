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
      <body>
        <header className="bg-blue-600 text-white py-3 px-4 shadow-md">
          <div className="container mx-auto">
            <h1 className="text-xl font-bold">Document Anonymizer</h1>
          </div>
        </header>
        <main className="container mx-auto py-6">
          {children}
        </main>
        <footer className="bg-gray-100 py-4 mt-8 border-t">
          <div className="container mx-auto text-center text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} Document Anonymizer - Privacy Tool
          </div>
        </footer>
      </body>
    </html>
  );
}
