// "use client";

import { Button } from "@heroui/button";
import Image from "next/image";

export default function Hero() {

  return (
  <>
    {/* Hero Section */}
    <section id="home" className="relative flex flex-col w-full min-h-screen justify-start items-start overflow-hidden">
      {/* Weights background image */}
      <Image
        src="/hero-weights-bg.webp"
        alt="Background weights"
        fill
        className="absolute inset-0 w-full h-full object-cover z-1 pointer-events-none select-none"
        style={{ pointerEvents: "none", userSelect: "none" }}
      />
      <Image
        src="/hero-angled-boxes.webp"
        alt="Colored background boxes"
        fill
        className="absolute z-0 object-contain pointer-events-none select-none transform translate-x-8 translate-y-12"
        style={{ pointerEvents: "none", userSelect: "none" }}
      />
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[700px] lg:max-w-[750px] h-full z-2 pointer-events-none">
        <Image
          src="/hero-cade.webp"
          alt="Cade Collenback hero image"
          width={300}
          height={570}
          className="absolute bottom-0 right-0 md:w-[350px] pointer-events-none select-none"
          style={{ pointerEvents: "none", userSelect: "none" }}
        />
      </div>

      <div className="absolute inset-0 flex flex-col w-full h-full items-center py-24 pb-16 sm:pb-20 md:pb-24 lg:pb-36 px-4 z-10 md:flex md:flex-row-reverse md:items-center md:justify-center lg:self-center">
        <div className="flex flex-col h-full justify-between items-start w-full max-w-[400px] md:max-w-[650px] lg:max-w-[650px] md:gap-6 lg:gap-8">
          <h1 className="w-full max-w-[400px] md:max-w-[450px] sm:pt-10 md:pt-20">
            <span className="text-gold-500">Athlete focused </span>personal training and nutritional coaching in San Antonio, Texas!
          </h1>

          <div className="flex flex-row md:flex-col items-end md:items-start justify-start md:self-start gap-2 md:gap-10 md:max-w-[500px]">
            <h2 className="flex-1 font-normal lg:text-base text-white text-right md:text-left w-auto md:w-[400px] lg:w-[400px] self-end">
              As a passionate personal trainer, I believe in empowering individuals to achieve their fitness goals through personalized coaching and support.
            </h2>
            <Button
              className="min-w-28 h-10 text-white text-[14px] px-2 font-bold lg:font-normal rounded-[13px] bg-gradient-gold lg:text-[16px]"
              style={{ 
                background: 'linear-gradient(180deg, #FFE98F 0%, #CB9F24 100%), #79DD1A' 
              }}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
      {/* Bottom overlay div */}
      <div 
        className="absolute bottom-0 left-0 right-0 w-full z-4 py-4 pb-0"
        style={{
          background: 'linear-gradient(180deg, rgba(26, 26, 26, 0.00) -20.09%, #1A1A1A 79.91%)',
          opacity: 0.7
        }}
      >
        <p 
          className="text-grey-500 text-center w-full uppercase z-3"
          style={{
            fontFamily: 'Oxanium',
            fontSize: 'clamp(24px, 10vw, 110px)',
            fontStyle: 'normal',
            fontWeight: 800,
            lineHeight: '60%',
            letterSpacing: '-0.406px',
            textTransform: 'uppercase',
            opacity: 0.15,
            background: 'linear-gradient(0deg, #FFF 0%, rgba(255, 255, 255, 0.00) 110%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          CADE COLLENBACK
        </p>
      </div>
    </section>
  </>
  );
}