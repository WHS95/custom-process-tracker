import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "커스텀 제작 진행 관리",
  description: "커스텀 제작 업체와 고객을 위한 진행 상황 추적 시스템",
};

// className={`${geistSans.variable} ${geistMono.variable} antialiased`
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
