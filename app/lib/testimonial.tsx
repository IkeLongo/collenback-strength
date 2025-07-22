import React from 'react';
import Image from 'next/image';

interface TestimonialProps {
  children?: React.ReactNode;
  className?: string;
}

interface TestimonialCardProps {
  quote: string;
  author: string;
  className?: string;
  height?: number; // New height prop
}

// Main Testimonial component (your existing one)
export default function Testimonial({
  children,
  className = ""
}: TestimonialProps) {
  return (
    <div className={`relative w-full ${className}`}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/home-testimonials-bg.webp"
          alt="Testimonials background"
          fill
          className="object-contain"
          priority
        />
        {/* Optional overlay for better text readability */}
        <div className="absolute inset-0"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}

// Export TestimonialCard as a named export
export function TestimonialCard({
  quote,
  author,
  className = ""
}: TestimonialCardProps) {
  return (
    <div className={`relative w-full flex items-center justify-center min-h-[400px] ${className}`}>
      {/* Custom HTML Background Design */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full max-w-lg md:max-w-xl lg:max-w-2xl">
          
          {/* Outer Decorative Border Div - Skinnier and Taller */}
          <div className="absolute inset-0 inset-x-6 -inset-y-5 border-[2.5px] border-gold-500 rounded-[10px] bg-transparent z-11"></div>
          
          {/* Opening Quotation Mark - Upper Left - Above background div */}
          <div className="absolute -top-10 left-10 w-12 h-8 md:w-10 md:h-10 bg-grey-700 rounded-full flex items-center justify-center z-30">
            <span 
              className="text-gold-500 text-[50px] font-anton pt-10 md:pt-8"
            >“</span>
          </div>
          
          {/* Closing Quotation Mark - Lower Right - Above background div */}
          <div className="absolute -bottom-10 right-10 w-12 h-8 md:w-10 md:h-10 bg-grey-700 rounded-full flex items-center justify-center z-30">
            <span 
              className="text-gold-500 text-[50px] font-anton pt-4 md:pt-6"
            >“</span>
          </div>
          
          {/* Custom Background Div with Tailwind - Now content-driven */}
          <div className="w-full bg-grey-700 border border-gold-500 opacity-85 rounded-[10px] min-h-[200px] relative z-10">
            
            {/* Testimonial Text Overlay */}
            <div className="relative z-20 flex flex-col justify-between py-10 px-16 md:px-18 lg:px-20 text-center min-h-[200px]">
              <blockquote className="text-white text-left font-outfit leading-relaxed flex-grow flex items-start !text-xl">
                {quote}
              </blockquote>
              <cite className="mt-2 lg:mt-6 text-right font-semibold md:text-lg font-outfit">
                - {author}
              </cite>
              {/* 5 Star Rating - Bottom Center, now inside the card */}
              <div className="flex justify-center mt-2 space-x-1">
                {[...Array(5)].map((_, index) => (
                  <Image
                    key={index}
                    src="/star.svg"
                    alt="Star"
                    width={16}
                    height={16}
                    className="w-4 h-4 md:w-5 md:h-5"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}