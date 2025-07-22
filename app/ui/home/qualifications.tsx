import Image from "next/image";
import InfoGraphic2 from "@/app/lib/info-graphic-2";
import HorizontalCarousel from "@/app/lib/comp-carosel";

import gradHat from '../../assets/grad-hat.json';
import dumbell from '../../assets/dumbell.json';

export default function Qualifications() {
  const qualifications = [
    {
      title: "M.S. Kinesiology in Strength & Human Performance",
      description: "Personalized workout plans with 1-to-1 attention from a certified trainer.",
      animation: gradHat
    },
    {
      title: "Westside Barbell Training & Athletic Coaching Certified",
      description: "Enhance athletic performance, correct weaknesses, and maximize power output.",
      animation: dumbell

    }
  ];

  return (
    <section id="qualifications" className="flex flex-col w-full max-w-[450px] md:max-w-[834px] lg:max-w-[1220px] mx-auto px-4 py-16 md:py-18 lg:py-24">

      <div className="flex flex-col md:flex-row md:items-center md:justify-center lg:items-start lg:gap-0 lg:max-w-[1000px] lg:self-center">
        {/* Header Content */}
        <div className="flex flex-col mb-4 md:mb-6 md:w-1/2 md:-mr-14 lg:mr-0 lg:mt-0 z-3">
          <h3 className="md:text-left lg:text-right text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6">
            Qualifications
          </h3>
          <p className="md:text-left lg:text-right text-base md:text-lg text-grey-100 max-w-3xl leading-relaxed">
            I'm a certified fitness trainer with over 10 years of experience, specializing in personal training and nutrition. I'm passionate about helping individuals transform their lives and aim to create a welcoming environment where everyone can thrive, regardless of fitness level.
          </p>
          {/* <div className="hidden lg:block">
            {qualifications.map((qual, index) => (
              <InfoGraphic2
                key={index}
                title={qual.title}
                description={qual.description}
                animation={qual.animation}
                iconSize={100}
              />
            ))}
          </div> */}
        </div>

        {/* Centered Photo */}
        <div className="flex justify-center items-center mb-0 md:mb-6 md:w-1/2 z-2">
          <div className="relative w-full h-96 md:w-[500px] md:h-[375px] lg:h-[500px] lg:w-[400px]">
            <Image
              src="/home-cade-solo-2.webp"
              alt="Cade Collenback - Personal Trainer"
              fill
              className="object-cover rounded-lg brightness-125 md:brightness-100"
              style={{ objectPosition: "top" }}
            />
          </div>
        </div>
      </div>

      {/* Qualifications List - Mobile: Single Carousel, Desktop: Two-Item Carousel */}
      <div className="md:hidden">
        <HorizontalCarousel
          gap="16px"
          className="mb-4"
          dotPadding='0px'
        >
          {qualifications.map((qual, index) => (
            <InfoGraphic2
              key={index}
              title={qual.title}
              description={qual.description}
              animation={qual.animation}
              iconSize={100}
            />
          ))}
        </HorizontalCarousel>
      </div>

      {/* Tablet: Side-by-side qualifications (no carousel) */}
      <div className="hidden md:flex px-8 md:px-0 gap-8 justify-center">
        {qualifications.map((qual, index) => (
          <InfoGraphic2
            key={index}
            title={qual.title}
            description={qual.description}
            animation={qual.animation}
            iconSize={100}
          />
        ))}
      </div>
    </section>
  );
}