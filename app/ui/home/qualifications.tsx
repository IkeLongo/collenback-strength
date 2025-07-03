import Image from "next/image";

export default function Qualifications() {
  return (
    <section className="flex flex-col w-full max-w-[450px] md:max-w-[834px] lg:max-w-[1220px] mx-auto px-4 py-4 pt-12 md:pt-24 lg:pt-12">

      <div className="flex flex-col md:flex-row md:gap-[52px]">
        {/* Header Content */}
        <div className="flex flex-col mb-4 md:mb-6 md:w-1/2 md:ml-10 lg:mt-10">
          <h3 className="text-right md:text-left lg:text-left text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6">
            Qualifications
          </h3>
          <p className="text-right md:text-left lg:text-left text-base md:text-lg text-grey-100 max-w-3xl leading-relaxed">
            I’m a certified fitness trainer with over 10 years of experience, specializing in personal training and nutrition. I’m passionate about helping individuals transform their lives and aim to create a welcoming environment where everyone can thrive, regardless of fitness level.
          </p>
        </div>

        {/* Centered Photo */}
        <div className="flex justify-center mb-12 md:mb-6 md:w-1/2">
          <div className="relative w-full h-96 md:w-[500px] md:h-[375px] lg:h-[450px] lg:w-[450px]">
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
    </section>
  );
}