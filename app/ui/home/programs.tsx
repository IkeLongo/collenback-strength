"use client";

import React from 'react';
import HorizontalCarousel from '@/app/lib/comp-carosel';
import TwoItemCarousel from '@/app/lib/two-item-carousel';
import InfoGraphic3 from '@/app/lib/info-graphic-3';

export default function Programs() {
  const programs = [
    {
      icon: "/coach.svg",
      heading: "In Person Training",
      subheading: "Personalized coaching with hands-on instruction.",
      description: "Train directly with Cade in a focused, supportive environment designed to push your limits safely and effectively. Each session is customized to improve strength, mobility, and overall performance.",
      buttonText: "Book Session",
      onButtonClick: () => {
        // Navigate to contact page with pre-selected service
        window.location.href = '/contact?service=personal-training';
      }
    },
    {
      icon: "/strong-guy.svg",
      heading: "Strength Programs",
      subheading: "Tried-and-tested plans, ready to follow.",
      description: "Choose from structured, downloadable strength training plans developed by Cade to improve power, endurance, and athletic performance—ideal for self-motivated individuals at any level.",
      buttonText: "Buy Programs",
      onButtonClick: () => {
        // Navigate to contact page with pre-selected service
        window.location.href = '/contact?service=strength-programs';
      }
    },
    {
      icon: "/plan.svg",
      heading: "Online Training",
      subheading: "Flexible programs, real results—wherever you are.",
      description: "Get access to personalized workout plans, video demonstrations, and progress check-ins—perfect for athletes or clients who prefer flexibility without sacrificing results.",
      buttonText: "Get Started",
      onButtonClick: () => {
        // Navigate to contact page with pre-selected service
        window.location.href = '/contact?service=online-training';
      }
    },
    {
      icon: "/diet.svg",
      heading: "Nutritional Guidance",
      subheading: "Train hard. Fuel right.",
      description: "Receive foundational tips, personalized macros, and meal structure recommendations that support your goals—whether you're building muscle, leaning out, or improving energy and recovery.",
      buttonText: "Learn More",
      onButtonClick: () => {
        // Navigate to contact page with pre-selected service
        window.location.href = '/contact?service=nutritional-guidance';
      }
    }
  ];

  return (
    <section id="programs" className="flex flex-col w-full max-w-[450px] md:max-w-[834px] lg:max-w-[1220px] mx-auto px-4 py-16 md:py-18 lg:py-24">
      
      {/* Header Content */}
      <div className="flex flex-col items-center text-center mb-8 md:mb-12">
        <h3 className="text-white font-bold text-2xl md:text-3xl lg:text-4xl font-outfit mb-4">
          Our Programs
        </h3>
        <p className="text-grey-100 text-base md:text-lg lg:text-xl font-outfit max-w-3xl md:max-w-2xl leading-relaxed">
          Discover our comprehensive fitness programs designed to help you achieve your goals, whether you're just starting out or looking to take your performance to the next level.
        </p>
      </div>

      {/* Mobile: Single Item Carousel */}
      <div className="md:hidden">
        <HorizontalCarousel
          gap="64px"
          className="mb-4"
          itemWidth="300px"
          dotPadding='48px'
        >
          {programs.map((program, index) => (
            <InfoGraphic3
              key={index}
              icon={program.icon}
              heading={program.heading}
              subheading={program.subheading}
              description={program.description}
              buttonText={program.buttonText}
              onButtonClick={program.onButtonClick}
              className="w-full"
            />
          ))}
        </HorizontalCarousel>
      </div>

      {/* Desktop: Two-Item Carousel */}
      <div className="hidden md:block md:px-16 lg:px-32">
        <div className="mx-auto max-w-2xl">
          <TwoItemCarousel
            containerWidth="648px" // 2 items (300px each) + gap (48px) = 648px
            gap="48px"
            itemWidth='300px'
            dotPadding='48px'
          >
            {programs.map((program, index) => (
              <InfoGraphic3
                key={index}
                icon={program.icon}
                heading={program.heading}
                subheading={program.subheading}
                description={program.description}
                buttonText={program.buttonText}
                onButtonClick={program.onButtonClick}
                className="w-full h-full"
              />
            ))}
          </TwoItemCarousel>
        </div>
      </div>
    </section>
  );
}