import { Metadata } from 'next';
import { Suspense } from 'react';
import { Terms } from '@/app/ui/terms/terms';

export const metadata: Metadata = {
  title: 'Privacy Policy - Cade Collenback Strength | San Antonio, TX',
  description: 'Learn how Cade Collenback Strength protects your personal information. Our privacy policy outlines data collection, usage, and security practices for our personal training services in San Antonio, Texas.',
  keywords: [
    'privacy policy',
    'data protection',
    'personal information security',
    'Cade Collenback privacy',
    'fitness data privacy',
    'San Antonio personal trainer privacy',
    'client confidentiality',
    'website privacy policy'
  ],
  openGraph: {
    title: 'Privacy Policy - Cade Collenback Strength',
    description: 'Learn how we protect your personal information and respect your privacy at Cade Collenback Strength in San Antonio, Texas.',
    url: 'https://collenbackstrength.com/privacy',
    type: 'website',
    images: [
      {
        url: '/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'Cade Collenback Strength Privacy Policy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy - Cade Collenback Strength',
    description: 'Learn how we protect your personal information and respect your privacy at Cade Collenback Strength.',
    images: ['/og-image.webp'],
  },
  alternates: {
    canonical: 'https://collenbackstrength.com/privacy',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Loading component for the suspense fallback
function ContactFormSkeleton() {
  return (
    <div className="w-full">
      <div className="md:hidden relative">
        <div className="w-full h-[300px] bg-gray-200 animate-pulse" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="h-8 w-48 bg-gray-300 animate-pulse rounded" />
          <div className="h-4 w-64 bg-gray-300 animate-pulse rounded mt-4" />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 w-full min-h-screen md:min-h-0">
        <div className="hidden md:flex md:flex-col md:justify-center md:items-center w-full h-screen">
          <div className="w-full h-full bg-gray-200 animate-pulse" />
        </div>
        
        <div className="relative flex flex-col items-center justify-start md:justify-center bg-transparent">
          <div className="w-full max-w-[500px] p-8 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 h-12 bg-gray-200 animate-pulse rounded-[13px]" />
              <div className="flex-1 h-12 bg-gray-200 animate-pulse rounded-[13px]" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1 h-12 bg-gray-200 animate-pulse rounded-[13px]" />
              <div className="flex-1 h-12 bg-gray-200 animate-pulse rounded-[13px]" />
            </div>
            <div className="h-32 bg-gray-200 animate-pulse rounded-[13px]" />
            <div className="h-12 bg-gray-200 animate-pulse rounded-[13px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Privacy() {
  return (
    <div className="flex flex-col items-center justify-start w-full h-auto">
      <main className="flex flex-col w-full h-full mx-4 pt-28">
        <Suspense fallback={<ContactFormSkeleton />}>
          <Terms />
        </Suspense>
      </main>
    </div>
  );
}