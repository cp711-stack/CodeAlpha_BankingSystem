import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinVerse — AI-Powered Digital Banking",
  description: "Next-generation digital banking platform with AI insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-white min-h-screen selection:bg-primary/30 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
