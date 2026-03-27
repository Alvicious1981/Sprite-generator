import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Providers } from "./providers.js";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sprite Generator",
  description: "AI-powered sprite sheet generator for Godot and Unity",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistMono.variable} antialiased bg-gray-50 text-gray-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
