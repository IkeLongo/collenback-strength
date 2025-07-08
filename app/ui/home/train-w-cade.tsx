// "use client";

import { Button } from "@heroui/button";
import Image from "next/image";

export default function TrainWithCade() {

  return (
  <>
    {/* Hero Section */}
    <div id="home" className="relative flex flex-col w-full min-h-screen justify-start items-start self-center overflow-hidden my-12 mb-0 max-w-[400px] md:max-w-[1000px]">
      {/* Cade background image */}
      <div className="absolute inset-0 w-full md:w-1/2 h-full z-1">
        <Image
          src="/home-train-w-cade.webp"
          alt="Background weights"
          fill
          className="object-cover pointer-events-none select-none"
          style={{ pointerEvents: "none", userSelect: "none" }}
        />
      </div>

      {/* Testimonials background image - Middle layer moved down */}
      <Image
        src="/home-testimonials-bg.webp"
        alt="Testimonials background"
        fill
        className="absolute inset-0 w-full h-full object-cover z-5 md:z-0 pointer-events-none select-none pt-64 md:pt-0"
        style={{ 
          pointerEvents: "none", 
          userSelect: "none",
        }}
      />

      <div className="absolute inset-0 flex flex-col w-full h-full items-center md:items-end justify-end md:justify-center py-24 pb-16 sm:pb-20 md:pb-24 lg:pb-36 px-4 z-10">
        <div className="flex flex-col gap-4 md:w-1/2 md:px-12">
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
            Get Started
          </Button>
        </div>
      </div>
    </div>
  </>
  );
}