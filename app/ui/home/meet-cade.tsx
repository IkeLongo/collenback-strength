import Image from "next/image";
import InfoGraphic from "@/app/lib/info-graphic-1";

export default function MeetCade() {
  return (
    <section className="flex flex-col w-full max-w-[450px] md:max-w-[834px] lg:max-w-[1220px] mx-auto px-4 py-4 md:pt-24 lg:pt-12">

      <div className="flex flex-col">
        <div className="md:flex md:flex-row-reverse">
          {/* Header Content */}
          <div className="flex flex-col mb-4 md:mb-6 md:w-1/2 md:ml-10 lg:justify-around">
            <div className="">
              <h3 className="text-left md:text-right lg:text-left text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6">
                Meet Cade!
              </h3>
              <p className="text-left md:text-right lg:text-left md:text-[16px] text-grey-100 max-w-3xl leading-relaxed">
                After years of playing collegiate football, Cade turned his passion for strength and performance into a mission: helping others build the mindset, discipline, and physical power needed to thrive.
              </p>
            </div>

            {/* Three Components Container */}
            <div className="hidden justify-between items-stretch lg:flex lg:mt-6 lg:gap-4 lg:mr-10">
              <div className="flex justify-center items-center md:w-1/3">
                <InfoGraphic 
                  number="6"
                  text="Years as<br>Collegiate Athlete"
                  className="lg:w-[175px] h-full"
                />
              </div>

              <div className="flex justify-center items-center md:w-1/3">
                <InfoGraphic 
                  number="10"
                  text="Years of<br>Experience"
                  className="lg:w-[175px] h-full"
                />
              </div>

              <div className="flex justify-center items-center md:w-1/3">
                <InfoGraphic 
                  number="15"
                  text="Years<br>in Sports"
                  className="lg:w-[175px] h-full"
                />
              </div>
            </div>
          </div>

          {/* Centered Photo */}
          <div className="flex justify-center mb-12 md:mb-6 md:w-1/2">
            <div className="relative w-full h-96 md:w-[500px] md:h-[375px] lg:h-[450px] lg:w-[450px]">
              <Image
                src="/home-cade-w-client-1.webp"
                alt="Cade Collenback - Personal Trainer"
                fill
                className="object-cover rounded-lg"
                style={{ objectPosition: "top" }}
              />
            </div>
          </div>
        </div>

        {/* Three Components Container */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-0 md:justify-between md:pt-10 lg:hidden">
          <div className="flex justify-center items-center w-full md:w-1/3">
            <InfoGraphic 
              number="6"
              text="Years as<br>Collegiate Athlete"
              className="w-[175px] md:w-[200px]"
            />
          </div>

          <div className="flex justify-center items-center w-full md:w-1/3">
            <InfoGraphic 
              number="10"
              text="Years of<br>Experience"
              className="w-[175px] md:w-[200px]"
            />
          </div>

          <div className="flex justify-center items-center w-full md:w-1/3">
            <InfoGraphic 
              number="15"
              text="Years<br>in Sports"
              className="w-[175px] md:w-[200px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}