import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import "react-toastify/dist/ReactToastify.css";

import { Navbar } from "../../react-component-library/src";
import Footer from "../ui/layout/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://collenbackstrength.com'),
  title: {
    default: 'Strength & Fitness Coaching in San Antonio, TX | Cade Collenback',
    template: '%s | Cade Collenback Strength',
  },
  description: 'Professional personal training and strength coaching in San Antonio, Texas. Cade Collenback offers athlete-focused fitness programs, strength training, and personalized coaching to help you achieve your goals.',
  keywords: [
    'personal trainer San Antonio',
    'fitness coaching Texas',
    'strength training',
    'nutritional coaching',
    'athlete training',
    'Cade Collenback',
    'gym San Antonio',
    'personal fitness trainer',
    'workout programs',
    'fitness goals'
  ],
  authors: [{ name: 'Cade Collenback' }],
  creator: 'Cade Collenback',
  publisher: 'Cade Collenback Strength',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Strength & Fitness Coaching in San Antonio, TX',
    description: 'Professional personal training and strength coaching with Cade Collenback. Athlete-focused fitness programs in San Antonio, Texas.',
    images: ['/og-image.webp'], // Update with your actual social media image
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://collenbackstrength.com',
    title: 'Strength & Fitness Coaching in San Antonio, TX | Cade Collenback',
    description: 'Professional personal training and strength coaching in San Antonio, Texas. Cade Collenback offers athlete-focused fitness programs, strength training, and personalized coaching.',
    siteName: 'Cade Collenback Strength',
    images: [
      {
        url: '/og-image.webp', // Update with your actual social media image
        width: 1014,
        height: 630,
        alt: 'Cade Collenback - Personal Trainer in San Antonio, Texas',
        type: 'image/webp',
      },
    ],
  },
  alternates: {
    canonical: 'https://collenbackstrength.com',
  },
  category: 'fitness',
  classification: 'Health & Fitness',
  other: {
    'geo.region': 'US-TX',
    'geo.placename': 'San Antonio',
    'geo.position': '29.4241;-98.4936', // San Antonio coordinates
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
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
        {children}
      <Footer>
      </Footer>
    </>
  );
}
