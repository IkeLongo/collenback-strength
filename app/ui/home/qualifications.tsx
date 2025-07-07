import Image from "next/image";
import InfoGraphic2 from "@/app/lib/info-graphic-2";
import HorizontalCarousel from "@/app/lib/comp-carosel";
import TwoItemCarousel from "@/app/lib/two-item-carousel";

export default function Qualifications() {
  const qualifications = [
    {
      title: "M.S. Kinesiology in Strength & Human Performance",
      description: "Personalized workout plans with 1-to-1 attention from a certified trainer."
    },
    {
      title: "Powerlifting Instructor & Bodybuilding Specialist",
      description: "High-intensity interval training to burn fat and improve cardiovascular health."
    },
    {
      title: "Westside Barbell Training & Athletic Coaching Certified",
      description: "Enhance athletic performance, correct weaknesses, and maximize power output."
    },
    {
      title: "ISSA Certified Personal Trainer",
      description: "Building muscle, increasing bone density, overall strength and endurance."
    },
    {
      title: "Strength & Conditioning Specialist & Master Trainer",
      description: "Addressing muscular imbalances and movement patterns to reduce pain."
    },
    {
      title: "Performance Enhancement Specialist & Nutrition",
      description: "Personalized workouts and nutrition guidance to meet your individual goals."
    }
  ];

  return (
    <section className="flex flex-col w-full max-w-[450px] md:max-w-[834px] lg:max-w-[1220px] mx-auto px-4 py-4 pt-16 md:pt-24 lg:pt-12">

      <div className="flex flex-col md:flex-row md:gap-[52px] lg:gap-0">
        {/* Header Content */}
        <div className="flex flex-col mb-4 md:mb-6 md:w-1/2 md:ml-10 lg:mt-10">
          <h3 className="text-right md:text-left lg:text-right text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6">
            Qualifications
          </h3>
          <p className="text-right md:text-left lg:text-right text-base md:text-lg text-grey-100 max-w-3xl leading-relaxed">
            I'm a certified fitness trainer with over 10 years of experience, specializing in personal training and nutrition. I'm passionate about helping individuals transform their lives and aim to create a welcoming environment where everyone can thrive, regardless of fitness level.
          </p>
          <div className="hidden lg:block">
            <HorizontalCarousel
              gap="16px"
              className="mb-4"
            >
              {qualifications.map((qual, index) => (
                <InfoGraphic2
                  key={index}
                  title={qual.title}
                  description={qual.description}
                />
              ))}
            </HorizontalCarousel>
          </div>
        </div>

        {/* Centered Photo */}
        <div className="flex justify-center items-center mb-0 md:mb-6 md:w-1/2">
          <div className="relative w-full h-96 md:w-[500px] md:h-[375px] lg:h-full lg:w-[400px]">
            <Image
              src="/home-cade-solo-2.webp"
              alt="Cade Collenback - Personal Trainer"
              fill
              className="object-cover rounded-lg"
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
        >
          {qualifications.map((qual, index) => (
            <InfoGraphic2
              key={index}
              title={qual.title}
              description={qual.description}
            />
          ))}
        </HorizontalCarousel>
      </div>

      {/* Desktop: Two-Item Carousel */}
      <div className="hidden md:block lg:hidden px-8 md:px-16">
        <TwoItemCarousel
          gap="16px"
          className="mb-4"
        >
          {qualifications.map((qual, index) => (
            <InfoGraphic2
              key={index}
              title={qual.title}
              description={qual.description}
            />
          ))}
        </TwoItemCarousel>
      </div>
    </section>
  );
}