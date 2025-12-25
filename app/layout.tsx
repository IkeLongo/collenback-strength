import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LoadingProvider } from "./ui/components/load/loading-context";
import PageLoadingManager from "./ui/components/load/page-loading-manager";
import FadeOverlay from "./ui/components/fade/fade-overlay";
import { ToastContainer } from "react-toastify";
import GoogleAnalytics from "./lib/analytics/google-analytics";
import CookieBanner from "./ui/cookies/banner";
import { SessionProvider } from "next-auth/react";
import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'
import { DisableDraftMode } from "./ui/components/button/disable-draft-mode";
import { SanityLive } from '@/sanity/lib/live'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function RootLayout({
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
              "description": "Professional strength and nutritional coaching in San Antonio, Texas",
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
                      "name": "Strength Coaching",
                      "description": "One-on-one personalized strength coaching"
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
        <SessionProvider>
          <LoadingProvider>
            <PageLoadingManager />
            <FadeOverlay />
              {children}
              <SanityLive />
              {(await draftMode()).isEnabled && (
                <>
                  <DisableDraftMode />
                  <VisualEditing />
                </>
              )}
            <ToastContainer limit={1} theme="dark" />
            <GoogleAnalytics />
            <CookieBanner />
          </LoadingProvider>
        </SessionProvider>
      </body>
    </html>
  );
}