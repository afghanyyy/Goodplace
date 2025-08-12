import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";

// Google Fonts: Inter (sans-serif) and Playfair Display (serif)
import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Good Place - Official Website",
  description: "Discover the world of luxury perfumes crafted just for you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logoputih.jpg" type="image/png" sizes="64x64" />
      </head>
      <body>{children}</body>
    </html>
  );
}
