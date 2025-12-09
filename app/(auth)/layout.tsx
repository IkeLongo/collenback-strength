import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

import { Navbar } from "../../react-component-library/src";
import { LoadingProvider } from "../ui/components/load/loading-context";
import CookieBanner from "@/app/ui/cookies/banner"
import Footer from "../ui/layout/footer";
import GoogleAnalytics from "../lib/analytics/google-analytics";
import FadeOverlay from "../ui/components/fade/fade-overlay";
import PageLoadingManager from "../ui/components/load/page-loading-manager";
import AuthContent from "./auth-content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Authentication | Cade Collenback Strength",
  description: "Access your personal training account and fitness programs.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Oxanium:wght@200..800&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet"/>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LoadingProvider>
          <PageLoadingManager />
          <FadeOverlay />
          <Navbar 
            logoSrc="/logo-stamp.png"
            navLinks={[
              { name: 'About', href: '/#about' },
              { name: 'Qualifications', href: '/#qualifications' },
              { name: 'Programs', href: '/#programs' },
              { name: 'Testimonials', href: '/#testimonials' },
              { name: 'FAQ', href: '/#faq' },
            ]}
            showBookingButton={true}
            bookingText="Message Me"
            bookingHref="/contact"
            backgroundColor="bg-grey-700"
          />
          <div className="w-full min-h-screen">
            {/* Top header section - only visible on mobile */}
            <div className="md:hidden relative pt-20">
              <div className="relative w-full h-[300px] pt-6 -mb-6">
                <img
                  src='/home-testimonials-bg.webp'
                  alt='Background'
                  className='absolute inset-0 w-full h-full object-cover opacity-50'
                />
                <div className="absolute inset-0 m-4 flex flex-col items-center justify-center">
                  <AuthContent isMobile={true} />
                </div>
              </div>
            </div>

            {/* Main content grid - desktop layout */}
            <div className="grid md:grid-cols-2 w-full min-h-screen">
              {/* Left side - desktop image */}
              <div className="hidden md:flex md:flex-col md:justify-center md:items-center w-full min-h-screen">
                <div className="w-full h-full relative flex justify-center items-center min-h-[800px] lg:min-h-[900px]">
                  <img
                    src='/home-testimonials-bg.webp'
                    alt='Background'
                    className='absolute inset-0 w-full h-full object-cover opacity-50 z-1'
                  />
                  <div className="absolute inset-0 mx-4 flex flex-col items-center justify-center bg-grey-700 bg-opacity-30">
                    <AuthContent />
                  </div>
                </div>
              </div>

              {/* Right side - form */}
              <div className="relative flex flex-col items-center justify-start md:justify-start bg-transparent rounded-t-[50px] md:rounded-none min-h-screen md:bg-white md:py-8">
                {/* Layer 3 */}
                <div className="absolute -top-6 left-0 right-0 bottom-0 bg-gold-300 max-w-[535px] mx-auto rounded-t-[50px] md:hidden z-1" style={{ minHeight: 'calc(100vh + 100px)' }}></div>
                {/* Layer 2 */}
                <div className="absolute -top-3 left-0 right-0 bottom-0 bg-gold-500 max-w-[525px] mx-auto rounded-t-[50px] md:hidden z-2" style={{ minHeight: 'calc(100vh + 100px)' }}></div>
                {/* Layer 1 */}
                <div className="relative w-full bg-white max-w-[515px] md:max-w-none rounded-t-[50px] md:rounded-none z-10 min-h-full md:min-h-[800px] lg:min-h-[900px] pt-0 md:pt-8 md:pb-8">
                  <div className="md:px-8 lg:px-12 xl:px-16">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Footer />
          <ToastContainer limit={1} theme="dark" />
          <GoogleAnalytics />
          <CookieBanner />
        </LoadingProvider>
      </body>
    </html>
  );
}