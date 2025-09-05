import Image from "next/image";
import InfoGraphic2 from "@/app/lib/info-graphic-2";
import HorizontalCarousel from "@/app/lib/comp-carosel";
import TwoItemCarousel from "@/app/lib/two-item-carousel";
import ThreeItemCarousel from "@/app/lib/three-item-carousel";

import gradHat from '../../assets/grad-hat.json';
import dumbell from '../../assets/dumbell.json';
import biceptFlex from '../../assets/bicep-flex.json';
import powerLifter from '../../assets/power-lifter.json';
import apple from '../../assets/apple.json';
import medal from '../../assets/medal.json';
import benchPress from '../../assets/bench-press.json';

export default function Qualifications() {
  const qualifications = [
  {
    title: "B.S. in Kinesiology",
    description: "Strong foundation in exercise science, human movement, and performance training.",
    animation: gradHat
  },
  {
    title: "M.S. in Kinesiology & Human Performance",
    description: "Advanced knowledge in strength development, conditioning, and athlete performance.",
    animation: gradHat
  },
  {
    title: "Certified Personal Trainer (ISSA-CPT)",
    description: "Personalized training programs tailored to your goals, fitness level, and lifestyle.",
    animation: dumbell
  },
  {
    title: "Strength & Conditioning Specialist",
    description: "Expertise in developing strength, speed, agility, and endurance for peak performance.",
    animation: biceptFlex
  },
  {
    title: "Bodybuilding & Physique Specialist",
    description: "Focused strategies to build lean muscle, sculpt your body, and improve aesthetics.",
    animation: powerLifter
  },
  {
    title: "Powerlifting Instructor",
    description: "Coaching in squat, bench, and deadlift technique to build maximal strength safely.",
    animation: powerLifter
  },
  {
    title: "Performance Enhancement Specialist",
    description: "Helping athletes improve mechanics, mobility, and overall athletic efficiency.",
    animation: dumbell
  },
  {
    title: "Certified Nutritionist",
    description: "Customized nutrition coaching to fuel training, recovery, and long-term health.",
    animation: apple
  },
  {
    title: "Master Trainer (ISSA)",
    description: "Elite-level certification demonstrating mastery across multiple fitness domains.",
    animation: medal
  },
  {
    title: "USAW Level 1 Coach",
    description: "Specialized in Olympic lifts to improve power, explosiveness, and athletic strength.",
    animation: powerLifter
  },
  {
    title: "Westside Barbell Certified Coach",
    description: "Trained in advanced strength methods to maximize power, speed, and recovery.",
    animation: benchPress
  },
  {
    title: "Westside Special Strengths (WSSS)",
    description: "Cutting-edge programming to address weaknesses and build elite performance.",
    animation: benchPress
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
            I'm a strength professional with over 10 years of experience, specializing in personal training and nutrition. I'm passionate about helping individuals transform their lives and aim to create a welcoming environment where everyone can thrive, regardless of fitness level.
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

      {/* Qualifications List - Mobile: Single Carousel*/}
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

      {/* Tablet: Two item carousel */}
      <div className="hidden md:block lg:hidden">
        <TwoItemCarousel
          containerWidth="700px" // Adjust as needed for your design
          gap="16px"
          dotPadding="16px"
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
        </TwoItemCarousel>
      </div>

      {/* Desktop: Three item carousel */}
      <div className="hidden lg:block">
        <ThreeItemCarousel
          containerWidth="1100px" // Adjust as needed for your design
          gap="16px"
          dotPadding="16px"
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
        </ThreeItemCarousel>
      </div>
    </section>
  );
}