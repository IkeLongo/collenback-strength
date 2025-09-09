"use client";

import { Button } from "@heroui/button";
import Image from "next/image";
import Link from "next/link";
import FadeInUp from "@/app/lib/components/fade-in-up";

import { useEffect, useState } from "react";
import { useLoading } from "@/app/lib/components/loading-context";

export default function Hero() {
  const { setLoading } = useLoading();
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (imageLoaded) setLoading(false);
  }, [imageLoaded, setLoading]);

  return (
  <>
    {/* Hero Section */}
    <section id="hero" className="relative flex flex-col w-full min-h-screen justify-start items-start overflow-hidden mb-[64px] lg:mb-[96px]">
      
      {/* Weights background image */}
      <Image
        src="/hero-weights-bg.webp"
        alt="Background weights"
        fill
        className="absolute inset-0 w-full h-full object-cover z-1 pointer-events-none select-none brightness-125 grayscale"
        style={{ pointerEvents: "none", userSelect: "none" }}
      />

      {/* Parent container with width boundary - only active on lg+ screens */}
      <div className="lg:max-w-[800px] lg:mx-auto lg:relative lg:w-full h-screen lg:min-h-[900px]">

        {/* Grouped background decorative images */}
        <div className="absolute bottom-0 right-0 sm:right-10 md:right-20 md:right-0 lg:right-0 z-3 pointer-events-none select-none">
          {/* Angled boxes background */}
          <div className="absolute z-2
            w-[900px] h-[800px] -bottom-24 -right-[300px]
            sm:w-[1200px] sm:h-[800px] sm:-bottom-24 sm:-right-[400px]
            md:w-[1400px] md:h-[900px] md:-bottom-28 md:-right-[500px]
            lg:w-[1400px] lg:h-[900px] lg:-bottom-32 lg:-right-[500px]
            ">
            <Image
              src="/hero-angled-boxes.webp"
              alt="Colored background boxes"
              fill
              className="object-contain"
              style={{ 
                pointerEvents: "none", 
                userSelect: "none"
              }}
            />
          </div>
          
          {/* Cade hero image */}
          <FadeInUp className="absolute z-4
              w-[90vw] min-w-[400px] max-w-[475px] h-[100vh] -bottom-32 -right-28
              sm:w-[90vw] sm:min-w-[400px] sm:max-w-[475px] sm:h-[100vh] sm:-bottom-20 sm:-right-28
              md:w-[90vw] md:min-w-[400px] md:max-w-[475px] md:h-[100vh] md:-bottom-20 md:-right-28
              lg:w-[90vw] lg:min-w-[400px] lg:max-w-[475px] lg:h-[1000px] lg:-bottom-24 lg:-right-20
              ">
            <Image
              src="/hero-cade.webp"
              alt="Cade Collenback hero image"
              fill
              className="object-contain"
              style={{ pointerEvents: "none", userSelect: "none" }}
              onLoadingComplete={() => setImageLoaded(true)}
            />
          </FadeInUp>
        </div>

        {/* Main content overlay */}
        <div className="absolute inset-0 flex flex-col w-full h-full items-center py-24 pb-20 sm:pt-36 sm:pb-20 md:pb-24 lg:pb-36 px-4 md:flex md:flex-row-reverse md:items-center md:justify-center lg:justify-end lg:left-0">
          <div className="flex flex-col h-full justify-between items-start w-full sm:max-w-[600px] lg:max-w-[600px] md:gap-6 lg:gap-8">
            <h1 className="w-full sm:text-[1.5rem]! md:text-[2.3rem]! max-w-[400px] md:max-w-[450px] sm:pt-10 md:pt-0 lg:pt-10 z-3">
              <FadeInUp>
                <span className="text-gold-500 italic">Athlete focused </span>strength, conditioning & nutritional coaching in San Antonio,<br className="sm:hidden"/> Texas!
              </FadeInUp>
            </h1>

            <div className="flex flex-row md:flex-col items-end md:items-start justify-start md:self-start gap-2 md:gap-10 md:max-w-[500px]">
              <h2 className="flex-1 font-normal lg:text-base text-white text-right md:text-left w-auto md:w-[400px] lg:w-[400px] self-end z-6">
                <FadeInUp>
                  As a strength and conditioning specialist, I believe in empowering individuals to achieve all their strength goals through personalized coaching and support.
                </FadeInUp>
              </h2>
              <FadeInUp className="z-7">
                <Button
                  className="min-w-28 h-10 text-grey-700 text-[14px] px-2 font-bold lg:font-normal rounded-[13px] bg-gradient-gold lg:text-[16px]"
                  
                  style={{ 
                    background: 'linear-gradient(180deg, #FFE98F 0%, #CB9F24 100%), #79DD1A' 
                  }}
                >
                  <Link href="/contact" className="h-full flex items-center justify-center text-grey-700! text-[1.1rem]!">
                    Let's Lift
                  </Link>
                </Button>
              </FadeInUp>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom overlay div */}
      <div 
        className="absolute bottom-0 left-0 right-0 w-full h-64 py-4 pb-0 z-5"
        style={{
          background: 'linear-gradient(180deg, rgba(26, 26, 26, 0.00) 0%, rgba(26, 26, 26, 1) 90%, #1A1A1A 100%)',
          opacity: 1
        }}
      >
        <p 
          className="absolute bottom-0 left-0 right-0 text-grey-500 text-center w-full uppercase z-3"
          style={{
            fontFamily: 'Oxanium',
            fontSize: 'clamp(24px, 10vw, 110px)',
            fontStyle: 'normal',
            fontWeight: 800,
            lineHeight: '100%',
            letterSpacing: '-0.406px',
            textTransform: 'uppercase',
            opacity: 0.35,
            background: 'linear-gradient(0deg, #6B7280 0%, rgba(255, 255, 255, 0.00) 95%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            transform: 'scaleY(1.5)',
          }}
        >
          CADE COLLENBACK
        </p>
      </div>
    </section>
  </>
  );
}