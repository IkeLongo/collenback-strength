import { Metadata } from 'next';
import { Suspense } from 'react';
import { ContactForm } from "../ui/contact/form";

export const metadata: Metadata = {
  title: 'Contact - Get Started with Strength Coaching in San Antonio, TX',
  description: 'Ready to start your fitness journey? Contact Cade Collenback for professional strength and nutritional coaching in San Antonio, Texas. Book your consultation today.',
  keywords: [
    'contact personal trainer San Antonio',
    'fitness consultation Texas',
    'book strength coaching session',
    'Cade Collenback contact',
    'gym consultation San Antonio',
    'fitness coaching inquiry',
    'personal trainer booking',
    'strength training consultation'
  ],
  openGraph: {
    title: 'Contact Cade Collenback - Strength Coach in San Antonio, TX',
    description: 'Ready to transform your fitness? Contact Cade Collenback for expert strength and nutritional coaching in San Antonio, Texas.',
    url: 'https://collenbackstrength.com/contact',
    type: 'website',
    images: [
      {
        url: '/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'Contact Cade Collenback - Strength Coach in San Antonio, Texas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Cade Collenback - Strength Coach in San Antonio, TX',
    description: 'Ready to start your fitness journey? Contact Cade Collenback for professional strength coaching in San Antonio, Texas.',
    images: ['/og-image.webp'],
  },
  alternates: {
    canonical: 'https://collenbackstrength.com/contact',
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

export default function Contact() {
  return (
    <div className="flex flex-col items-center justify-start w-full h-auto">
      <main className="flex flex-col w-full h-full mx-4">
        <Suspense fallback={<ContactFormSkeleton />}>
          <ContactForm />
        </Suspense>
      </main>
    </div>
  );
}