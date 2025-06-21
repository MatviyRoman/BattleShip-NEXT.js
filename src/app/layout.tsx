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
  title: "Battleship Game — Next.js, React, TypeScript, Tailwind CSS, PHP, Laravel",
  description:
    "Play Battleship online! Modern implementation with Next.js, React, TypeScript, Tailwind CSS, PHP, Laravel. Developed by Roman Matviy. Portfolio: https://roman.matviy.pp.ua",
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
          title="Roman Matviy — Full Stack Web Developer Portfolio (Laravel, Next.js, React, TypeScript, Tailwind CSS, PHP)"
          className="fixed top-4 right-4 z-[2000] text-xs text-gray-500 hover:text-blue-600 bg-white/80 px-3 py-1 rounded shadow border border-gray-200 transition-colors"
        >
          Roman Matviy — Full Stack Web Developer Portfolio (Laravel, Next.js, React, TypeScript, Tailwind CSS, PHP)
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
          . All rights reserved. PHP, Laravel, Next.js, React, TypeScript, Tailwind CSS.
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {['next','react','vue','nuxt','laravel','php','sql','nodejs','typescript','javascript','html','css','tailwind'].map(tag => {
              const seoTag = tag.replace(/\./g, '-').replace(/\s+/g, '-').toLowerCase();
              return (
                <a
                  key={tag}
                  href={`https://roman.matviy.pp.ua/${seoTag}/`}
                  target="_blank"
                  className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-blue-100 hover:text-blue-700 border border-gray-200 text-[11px] transition-colors"
                >
                  #{tag}
                </a>
              );
            })}
          </div>
        </footer>
      </body>
    </html>
  );
}
