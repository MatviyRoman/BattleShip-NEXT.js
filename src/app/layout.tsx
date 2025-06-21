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
  title: "Battleship Game — Next.js, React, TypeScript, Tailwind CSS",
  description:
    "Play Battleship online! Modern implementation with Next.js, React, TypeScript, Tailwind CSS. Developed by Roman Matviy. Portfolio: https://roman.matviy.pp.ua",
  other: {
    author: "Roman Matviy",
    portfolio: "https://roman.matviy.pp.ua",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a
          href="https://roman.matviy.pp.ua"
          target="_blank"
          title="Roman Matviy — Full Stack Web Developer Portfolio (Laravel, Next.js, React, TypeScript, Tailwind CSS)"
          className="fixed top-4 right-4 z-[2000] text-xs text-gray-500 hover:text-blue-600 bg-white/80 px-3 py-1 rounded shadow border border-gray-200 transition-colors"
        >
          Roman Matviy — Full Stack Web Developer Portfolio (Laravel, Next.js, React, TypeScript, Tailwind CSS)
        </a>
        {children}
        <footer className="w-full text-center py-4 text-xs text-gray-400 mt-8">
          © {new Date().getFullYear()}{" "}
          <a
            href="https://romandev.pp.ua"
            target="_blank"
            className="hover:underline text-gray-500"
          >
            Roman Matviy
          </a>
          . All rights reserved.
        </footer>
      </body>
    </html>
  );
}
