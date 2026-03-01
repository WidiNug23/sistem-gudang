import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gudang Digital",
  description: "Sistem Manajemen Stok",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-[#0f1115]">
      <body className={`${geistSans.className} antialiased text-slate-200`}>
        {children}
      </body>
    </html>
  );
}