// "use client";

import { Button } from "@heroui/button";
import Image from "next/image";
import Link from "next/link";
import FadeInUp from "@/app/lib/components/fade-in-up";

export default function TrainWithCade() {

  return (
  <>
    {/* Train w Cade Section */}
    <div id="home" className="relative flex flex-col w-full min-h-screen justify-start items-start self-center overflow-visible md:max-w-[1000px] px-4 py-16 md:py-18 lg:py-28">
      {/* Cade background image */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 flex flex-col w-full max-w-[500px] h-full z-10">
        <FadeInUp className="flex flex-col w-full max-w-[500px] h-full">
          <Image
            src="/home-train-w-cade.webp"
            alt="Cade Collenback - Personal Trainer"
            fill
            className="object-cover object-top object-center pointer-events-none select-none brightness-125 md:brightness-100"
            style={{ pointerEvents: "none", userSelect: "none" }}
          />
          {/* Gradient fade overlay */}
          <div 
            className="absolute inset-0 mt-40 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(28, 25, 25, 0.00) 50%, #1A1A1A 92.5%)'
            }}
          />
        </FadeInUp>
      </div>

      {/* Testimonials background image */}
      <Image
        src="/home-testimonials-bg.webp"
        alt="Testimonials background"
        width={400}
        height={400}
        className="hidden md:block absolute inset-x-0 -bottom-52 top-auto w-full max-w-[800px] z-0 md:top-16 md:bottom-auto pointer-events-none select-none"
        style={{ 
          pointerEvents: "none", 
          userSelect: "none",
        }}
      />

      <div className="absolute inset-0 flex flex-col w-full h-full items-center md:items-end justify-end md:justify-end sm:pb-0 md:pb-24 px-4 z-30">
        <div className="flex flex-col gap-4 md:pb-0 md:w-1/2 md:px-12">
          <h3 className="flex-1 font-normal lg:text-base text-white text-left md:text-left w-auto">
            <FadeInUp>
              Want to train <br />with me?
            </FadeInUp>
          </h3>
          <p className="flex-1 font-normal lg:text-base text-white text-left md:text-left w-auto">
            <FadeInUp>
              Let's get started meeting your goals today!
            </FadeInUp>
          </p>
          <FadeInUp className="flex flex-col w-full h-full">
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
          </FadeInUp>
        </div>
      </div>
    </div>
  </>
  );
}