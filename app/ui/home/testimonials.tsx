"use client";

import React from 'react';
import Testimonial, { TestimonialCard } from '@/app/lib/testimonial';
import FullWidthCarousel from '@/app/lib/comp-carosel';

export default function Testimonials() {
  const testimonials = [
    {
      quote: "Cade transformed my fitness journey completely. His personalized approach helped me achieve goals I never thought possible.",
      author: "Sarah Johnson"
    },
    {
      quote: "The nutrition guidance and training programs are incredible. I've never felt stronger or more confident in my abilities.",
      author: "Mike Rodriguez"
    },
    {
      quote: "Working with Cade has been life-changing. His expertise and motivation pushed me beyond my limits safely and effectively.",
      author: "Emily Chen"
    },
    {
      quote: "I've tried many trainers before, but none compare to Cade's knowledge and dedication to helping his clients succeed.",
      author: "James Wilson"
    },
    {
      quote: "The results speak for themselves. Cade's training methods are scientifically sound and incredibly effective.",
      author: "Amanda Foster"
    },
    {
      quote: "From day one, Cade believed in my potential. His support and expertise helped me reach fitness goals I never imagined.",
      author: "David Martinez"
    }
  ];

  return (
    <section id="testimonials" className="flex flex-col w-full mx-auto py-16 pb-4 md:py-18 md:pb-4 lg:py-24 lg:pb-10">
      <Testimonial>
        <div className="flex flex-col items-center text-center mb-8 md:mb-12">
          <h3 className="text-white font-bold text-center pt-4 md:text-3xl lg:text-4xl font-outfit mb-4">
            REAL CLIENTS. <br className='md:hidden'/>REAL RESULTS.
          </h3>

          {/* Testimonials Carousel with Custom Width */}
          <div className="w-full max-w-4xl">
            <FullWidthCarousel
              gap="10px"
              className=""
            >
              {testimonials.map((testimonial, index) => (
                <TestimonialCard
                  key={index}
                  quote={testimonial.quote}
                  author={testimonial.author}
                  height={100} // Custom height for the testimonial card
                />
              ))}
            </FullWidthCarousel>
          </div>
        
        </div>
      </Testimonial>
    </section>
  );
}