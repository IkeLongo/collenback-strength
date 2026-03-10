import LegalPage from '@/app/components/legal/components/LegalPage';
import { Metadata } from 'next';
import LegalToc from '@/app/components/legal/components/LegalToc';
import TermsContent from '@/app/components/legal/content/terms-content';

export const metadata: Metadata = {
  title: 'Privacy Policy - Cade Collenback Strength | San Antonio, TX',
  description: 'Learn how Cade Collenback Strength protects your personal information. Our privacy policy outlines data collection, usage, and security practices for our strength coaching services in San Antonio, Texas.',
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

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      lastUpdated="March 5, 2026"
      toc={<LegalToc />}
    >
      <TermsContent />
    </LegalPage>
  );
}