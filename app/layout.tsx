import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GudangPro - Manajemen Logistik",
  description: "Management & Logistics Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body 
        className={`${geistSans.variable} font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen flex flex-col`}
        suppressHydrationWarning={true}
      >
        {/* Navbar Global di Setiap Halaman */}
        <Navbar />

        <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto">
          {children}
        </main>

        <footer className="py-6 text-center border-t border-slate-200 dark:border-slate-800 mt-auto">
          <p className="text-slate-400 text-xs font-medium">Widi Nugroho &copy; 2026</p>
        </footer>
      </body>
    </html>
  );
}