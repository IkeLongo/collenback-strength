import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Navbar } from "../react-component-library/src";
import Footer from "./ui/nav/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Collenback Strength",
  description: "Professional strength training and fitness coaching services",
};

export default function RootLayout({
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
        <Navbar 
          logoSrc="/logo-whiteout.png"
          navLinks={[
            { name: 'Home', href: '/' },
            { name: 'About', href: '/about' },
            { name: 'Qualifications', href: '/qualifications' },
            { name: 'Services', href: '/services' },
            { name: 'Testimonials', href: '/testimonials' },
            { name: 'FAQ', href: '/faq' },
          ]}
          showBookingButton={true}
          bookingText="Book a Call"
          bookingHref="/signup"
          backgroundColor="bg-grey-700"
        />
        {children}
        <Footer>
          
        </Footer>
      </body>
    </html>
  );
}
