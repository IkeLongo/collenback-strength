// "use client";

import { Button } from "@heroui/button";
import Image from "next/image";
import Link from "next/link";

export default function TrainWithCade() {

  return (
  <>
    {/* Train w Cade Section */}
    <div id="home" className="relative flex flex-col w-full min-h-screen justify-start items-start self-center overflow-hidden md:max-w-[1000px] px-4 py-16 md:py-18 lg:py-28">
      {/* Cade background image */}
      <div className="absolute inset-0 top-16 flex flex-col w-full max-w-[600px] h-full items-center justify-center py-16 sm:pb-20 md:pb-24 px-4 z-10">
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
        className="absolute inset-0 top-16 w-full max-w-[800px] h-full object-center z-1 md:z-0 pointer-events-none select-none"
        style={{ 
          pointerEvents: "none", 
          userSelect: "none",
        }}
      />

      <div className="absolute inset-0 flex flex-col w-full h-full items-center md:items-end justify-end md:justify-center py-16 sm:pb-20 md:pb-24 px-4 z-10">
        <div className="flex flex-col gap-4 md:pb-0 md:w-1/2 md:px-12">
          <h3 className="flex-1 font-normal lg:text-base text-white text-left md:text-left w-auto">
            Want to train <br />with me?
          </h3>
          <p className="flex-1 font-normal lg:text-base text-white text-left md:text-left w-auto">
            Let's get started meting your goals today!
          </p>
          <Button
            className="min-w-28 h-10 px-2 rounded-[13px] bg-gradient-gold md:max-w-[292px]"
            style={{ 
              background: 'linear-gradient(180deg, #FFE98F 0%, #CB9F24 100%), #79DD1A' 
            }}
          >
            <Link href="/contact" className="h-full flex items-center justify-center !text-grey-700 !text-[16px] font-semibold">
              Get Started
            </Link>
          </Button>
        </div>
      </div>
    </div>
  </>
  );
}