"use client";

import React from 'react';
import Testimonial, { TestimonialCard } from '@/app/lib/testimonial';
import FullWidthCarousel from '@/app/lib/comp-carosel';
import FadeInUp from '@/app/lib/components/fade-in-up';

export default function Testimonials() {
  const testimonials = [
    {
      quote: "\"I increased my vertical jump to 34 inches—up an inch and a half from last time. The Sunday sessions are clearly paying off!\"",
      author: "Luke C"
    },
    {
      quote: "\"My coach told the whole team my power clean form was perfect. Training with Cade has taken my technique to another level.\"",
      author: "Roo H"
    },
    {
      quote: "\"You have a bright future. If I ever get the chance to be a head coach, I’d want someone like you to run my program.\"",
      author: "Division I Football Coach"
    },
    {
      quote: "\"To our family, you’re the best in the business. No one ever took a chance on me like you’ve taken on my son. It’s an investment we’ll always make—thank you for being that person in his life.\"",
      author: "Martin G"
    },
    {
      quote: "\"We’ve seen the strength and the difference he’s gained. The progress is undeniable.\"",
      author: "Laura G"
    },
    {
      quote: "\"Cade has done an amazing job taking care of my body now that I’m no longer a college athlete. I’ve never felt—or looked—better.\"",
      author: "Chase Locke, Wyoming WR"
    }
  ];


  return (
    <section id="testimonials" className="flex flex-col w-full mx-auto py-16 pb-4 md:py-18 md:pb-4 lg:py-24 lg:pb-10">
      <Testimonial>
        <div className="flex flex-col items-center text-center mb-8 md:mb-12">
          <FadeInUp>
            <h3 className="text-white font-bold text-center pt-4 md:text-3xl lg:text-4xl font-outfit -mb-6 md:mb-4">
              REAL CLIENTS. <br className='md:hidden'/>REAL RESULTS.
            </h3>
          </FadeInUp>

          {/* Testimonials Carousel with Custom Width */}
          <FadeInUp className="w-full max-w-4xl flex flex-col items-start">
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
          </FadeInUp>
        
        </div>
      </Testimonial>
    </section>
  );
}