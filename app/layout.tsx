import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navigation/navbar";
import { BottomNav } from "@/components/navigation/bottom-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CashFlow Pilot | Lập kế hoạch mua nhà với thu nhập biến động",
  description: "Ứng dụng tài chính cá nhân thông minh: Quản trị dòng tiền 2 kỳ, van điều tiết ngày 20, 3 Két tích lũy và mô phỏng vay Big 4 năm 2031.",
  applicationName: "CashFlow Pilot",
  keywords: ["Tài chính cá nhân", "Thu nhập biến động", "Mua nhà Đà Nẵng", "Lãi kép", "DSR", "Van điều tiết", "CashFlow Pilot"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#090d16",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#090d16] text-slate-100 selection:bg-blue-600 selection:text-white">
        <Navbar />
        <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-4 pb-24">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
