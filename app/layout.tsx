import type { Metadata } from "next";
import { Geist } from "next/font/google"; // Impor font Geist
import "./globals.css"; // Pastikan globals.css diimpor jika ada

// 1. Inisialisasi font Geist
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Production System",
  description: "Manufacturing Execution System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth" suppressHydrationWarning>
      <body 
        // 2. Sekarang geistSans sudah terdefinisi dan bisa digunakan
        className={`${geistSans.variable} font-sans antialiased bg-[#0f1115] text-slate-200 selection:bg-blue-500 selection:text-white`}
        suppressHydrationWarning={true}
      >
        <div className="relative min-h-screen flex flex-col">
          {/* Overlay Noise */}
          <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-[9999]"></div>
          
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}