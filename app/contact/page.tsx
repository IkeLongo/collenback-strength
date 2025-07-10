import { Metadata } from 'next';
import { ContactForm } from "../ui/contact/form";

export const metadata: Metadata = {
  title: 'Contact - Get Started with Personal Training in San Antonio, TX',
  description: 'Ready to start your fitness journey? Contact Cade Collenback for professional personal training and nutritional coaching in San Antonio, Texas. Book your consultation today.',
  keywords: [
    'contact personal trainer San Antonio',
    'fitness consultation Texas',
    'book personal training session',
    'Cade Collenback contact',
    'gym consultation San Antonio',
    'fitness coaching inquiry',
    'personal trainer booking',
    'strength training consultation'
  ],
  openGraph: {
    title: 'Contact Cade Collenback - Personal Training in San Antonio, TX',
    description: 'Ready to transform your fitness? Contact Cade Collenback for expert personal training and nutritional coaching in San Antonio, Texas.',
    url: 'https://collenbackstrength.com/contact',
    type: 'website',
    images: [
      {
        url: '/hero-cade.webp',
        width: 1200,
        height: 630,
        alt: 'Contact Cade Collenback - Personal Trainer in San Antonio, Texas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Cade Collenback - Personal Training in San Antonio, TX',
    description: 'Ready to start your fitness journey? Contact Cade Collenback for professional personal training in San Antonio, Texas.',
    images: ['/hero-cade.webp'],
  },
  alternates: {
    canonical: 'https://collenbackstrength.com/contact',
  },
};

export default function Home() {

  return (
    <div className="flex flex-col items-center justify-start w-full h-auto">
      <main className="flex flex-col w-full h-full mx-4">
        <ContactForm />
      </main>
    </div>
  );
}