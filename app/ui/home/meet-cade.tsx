import Image from "next/image";
import InfoGraphic from "@/app/ui/components/info-graphic/info-graphic-1";
import FadeInUp from "@/app/ui/components/fade/fade-in-up";

export default function MeetCade() {
  return (
    <section id="about" className="scroll-mt-12 flex flex-col w-full max-w-[450px] md:max-w-[834px] lg:max-w-[1220px] mx-auto px-4 py-16 md:py-18 lg:py-28">

      <div className="flex flex-col gap-20">
        <div className="md:flex md:flex-row-reverse md:items-center lg:items-start md:justify-center">
          {/* Header Content */}
          <div className="flex flex-col md:w-[400px] md:-ml-40 lg:ml-10 md:justify-center">
            <div className="z-3">
              <FadeInUp>
                <h3 className="text-left md:text-right lg:text-left text-2xl font-bold text-white mb-4 md:mb-6">
                  About Cade
                </h3>
              </FadeInUp>
              <FadeInUp>
                <p className="text-left md:text-right lg:text-left md:text-[16px] text-grey-100 max-w-3xl leading-relaxed"
                  style={{
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
                  }}>
                    After years of playing collegiate football, Cade turned his passion for strength and performance into a mission: helping others build the mindset, discipline, and physical power needed to thrive.
                </p>
              </FadeInUp>
            </div>
          </div>

          {/* Centered Photo */}
          <div className="flex justify-center items-center pt-6 lg:pt-0">
            <div className="relative
                            w-full h-96
                            md:w-[500px] md:h-[450px]"
            >
              <FadeInUp className="w-full h-full">
                <Image
                  src="/home-cade-w-client-1.webp"
                  alt="Cade Collenback - Personal Trainer"
                  fill
                  className="object-cover rounded-[10px] brightness-75 z-2 object-top"
                />
              </FadeInUp>
            </div>
          </div>
        </div>

        {/* Three Components Container */}
        <FadeInUp className="flex flex-col lg:flex-row justify-center items-center gap-16 md:gap-20 md:justify-between md:pt-10 lg:max-w-[1000px] lg:self-center">
          <div className="flex flex-col justify-center items-center w-full md:w-4/6">
            <InfoGraphic 
              number="6"
              text="Years as<br>Collegiate Athlete"
              className="w-full pr-10 lg:px-8"
            />
          </div>

          <div className="flex justify-center items-center w-full md:w-4/6">
            <InfoGraphic 
              number="10"
              text="Years of<br>Experience"
              className="w-full lg:px-8"
            />
          </div>

          <div className="flex justify-center items-center w-full md:w-4/6">
            <InfoGraphic 
              number="15"
              text="Years<br>in Sports"
              className="w-full lg:px-8"
            />
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}