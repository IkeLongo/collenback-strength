import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

import { Navbar } from "../react-component-library/src";
import CookieBanner from "@/app/ui/cookies/banner"
import Footer from "./ui/layout/footer";
import GoogleAnalytics from "./lib/analytics/google-analytics";

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
    default: 'Personal Training & Fitness Coaching in San Antonio, TX | Cade Collenback',
    template: '%s | Cade Collenback Strength',
  },
  description: 'Professional personal training and nutritional coaching in San Antonio, Texas. Cade Collenback offers athlete-focused fitness programs, strength training, and personalized coaching to help you achieve your goals.',
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
    title: 'Personal Training & Fitness Coaching in San Antonio, TX',
    description: 'Professional personal training and nutritional coaching with Cade Collenback. Athlete-focused fitness programs in San Antonio, Texas.',
    images: ['/og-image.webp'], // Update with your actual social media image
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://collenbackstrength.com',
    title: 'Personal Training & Fitness Coaching in San Antonio, TX | Cade Collenback',
    description: 'Professional personal training and nutritional coaching in San Antonio, Texas. Cade Collenback offers athlete-focused fitness programs, strength training, and personalized coaching.',
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Oxanium:wght@200..800&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet"/>

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Gym",
              "name": "Cade Collenback Strength",
              "description": "Professional personal training and nutritional coaching in San Antonio, Texas",
              "url": "https://collenbackstrength.com",
              "telephone": "(210) 701-2655",
              "email": "contact@collenbackstrength.com",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "San Antonio",
                "addressRegion": "TX",
                "addressCountry": "US"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "29.4241",
                "longitude": "-98.4936"
              },
              "owner": {
                "@type": "Person",
                "name": "Cade Collenback",
                "jobTitle": "Personal Trainer & Fitness Coach"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Fitness Services",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Personal Training",
                      "description": "One-on-one personalized fitness coaching"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Nutritional Coaching",
                      "description": "Expert guidance on meal planning and nutrition"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Strength Training Programs",
                      "description": "Athlete-focused strength and conditioning programs"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Online Coaching",
                      "description": "Remote fitness coaching and workout plans"
                    }
                  }
                ]
              },
              "sameAs": [
                // Add your social media URLs here
                // "https://www.instagram.com/cadecollenback",
                // "https://www.facebook.com/collenbackstrength"
              ]
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar 
          logoSrc="/logo-whiteout.png"
          navLinks={[
            { name: 'Home', href: '#home' },
            { name: 'About', href: '#about' },
            { name: 'Qualifications', href: '#qualifications' },
            { name: 'Programs', href: '#programs' },
            { name: 'Testimonials', href: '#testimonials' },
            { name: 'FAQ', href: '#faq' },
          ]}
          showBookingButton={true}
          bookingText="Message Me"
          bookingHref="/contact"
          backgroundColor="bg-grey-700"
        />
        {children}
        <Footer>
        </Footer>
        <ToastContainer limit={1} theme="dark" />
        <GoogleAnalytics />
        <CookieBanner />
      </body>
    </html>
  );
}
