import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LoadingProvider } from "./ui/components/load/loading-context";
import PageLoadingManager from "./ui/components/load/page-loading-manager";
import FadeOverlay from "./ui/components/fade/fade-overlay";
import { ToastContainer } from "react-toastify";
import GoogleAnalytics from "./lib/analytics/google-analytics";
import CookieBanner from "./ui/cookies/banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cade Collenback Strength",
  description: "Professional strength and fitness coaching in San Antonio, Texas.",
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
        <LoadingProvider>
          <PageLoadingManager />
          <FadeOverlay />
            {children}
          <ToastContainer limit={1} theme="dark" />
          <GoogleAnalytics />
          <CookieBanner />
        </LoadingProvider>
      </body>
    </html>
  );
}