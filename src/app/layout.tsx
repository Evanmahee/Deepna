import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppChrome } from "@/components/AppChrome";
import { PushRegister } from "@/components/PushRegister";
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
  title: "Deepna",
  description: "Développement personnel — Deepna",
  applicationName: "Deepna",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body
        className="min-h-full flex flex-col bg-[#0a0a0f] text-white"
        style={{ backgroundColor: "#0a0a0f", color: "#ffffff" }}
      >
        <PushRegister />
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
