import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Weather Dashboard",
  description: "Advanced weather dashboard using OpenWeatherMap API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
