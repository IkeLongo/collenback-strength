// "use client";

import { Button } from "@heroui/button";
import Image from "next/image";
import Link from "next/link";

export default function TrainWithCade() {

  return (
  <>
    {/* Hero Section */}
    <div id="home" className="relative flex flex-col w-full min-h-screen justify-start items-start self-center overflow-hidden mb-24 md:my-18 md:max-w-[1000px]">
      {/* Cade background image */}
      <div className="absolute bg-grey-700 left-1/2 transform -translate-x-1/2 md:left-1/3 md:-translate-x-1/2 lg:left-10 lg:translate-x-0 top-[400px] -translate-y-1/2 max-w-[450px] w-full h-full z-2">
        <Image
          src="/home-train-w-cade.webp"
          alt="Background weights"
          fill
          className="object-cover object-top pointer-events-none select-none brightness-125 md:brightness-100"
          style={{ pointerEvents: "none", userSelect: "none" }}
        />
        
        {/* Gradient fade overlay */}
        <div 
          className="absolute inset-0 mt-40 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(180deg, rgba(28, 25, 25, 0.00) 50%, #1A1A1A 92.5%)'
          }}
        />
      </div>

      {/* Testimonials background image - Middle layer moved down */}
      <Image
        src="/home-testimonials-bg.webp"
        alt="Testimonials background"
        fill
        className="absolute inset-0 w-full max-w-[800px] h-full object-center z-1 md:z-0 pointer-events-none select-none"
        style={{ 
          pointerEvents: "none", 
          userSelect: "none",
        }}
      />

      <div className="absolute inset-0 flex flex-col w-full h-full items-center md:items-end justify-end md:justify-center pb-16 sm:pb-20 md:pb-24 px-4 z-10">
        <div className="flex flex-col gap-4 md:pb-0 md:w-1/2 md:px-12">
          <h3 className="flex-1 font-normal lg:text-base text-white text-left md:text-left w-auto">
            Want to train <br />with me?
          </h3>
          <p className="flex-1 font-normal lg:text-base text-white text-left md:text-left w-auto">
            Let's get started meting your goals today!
          </p>
          <Button
            className="min-w-28 h-10 text-white text-[14px] px-2 font-bold lg:font-normal rounded-[13px] bg-gradient-gold md:max-w-[292px] lg:text-[16px]"
            style={{ 
              background: 'linear-gradient(180deg, #FFE98F 0%, #CB9F24 100%), #79DD1A' 
            }}
          >
            <Link href="/contact" className="h-full flex items-center justify-center">
              Get Started
            </Link>
          </Button>
        </div>
      </div>
    </div>
  </>
  );
}