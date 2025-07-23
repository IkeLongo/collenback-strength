import Image from "next/image";
import InfoGraphic from "@/app/lib/info-graphic-1";

export default function MeetCade() {
  return (
    <section id="about" className="scroll-mt-12 flex flex-col w-full max-w-[450px] md:max-w-[834px] lg:max-w-[1220px] mx-auto px-4 py-16 md:py-18 lg:py-28">

      <div className="flex flex-col gap-20">
        <div className="md:flex md:flex-row-reverse md:items-center lg:items-start md:justify-center">
          {/* Header Content */}
          <div className="flex flex-col md:w-[400px] md:-ml-40 lg:ml-10 md:justify-center">
            <div className="z-3">
              <h3 className="text-left md:text-right lg:text-left text-2xl font-bold text-white mb-4 md:mb-6">
                Meet Cade!
              </h3>
              <p className="text-left md:text-right lg:text-left md:text-[16px] text-grey-100 max-w-3xl leading-relaxed"
                style={{
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
                }}>
                After years of playing collegiate football, Cade turned his passion for strength and performance into a mission: helping others build the mindset, discipline, and physical power needed to thrive.
              </p>
            </div>

            {/* Three Components Container */}
            {/* <div className="hidden justify-between items-stretch lg:flex lg:mt-6 lg:gap-4 lg:mr-10">
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
            </div> */}
          </div>

          {/* Centered Photo */}
          <div className="flex justify-center items-center pt-6 lg:pt-0">
            <div className="relative
                            w-full h-96
                            md:w-[500px] md:h-[450px]"
            >
              <Image
                src="/home-cade-w-client-1.webp"
                alt="Cade Collenback - Personal Trainer"
                fill
                className="object-cover rounded-[10px] brightness-75 z-2 object-top"
                //style={{ objectPosition: "top" }}
              />
            </div>
          </div>
        </div>

        {/* Three Components Container */}
        <div className="flex flex-col lg:flex-row justify-center items-center gap-16 md:gap-20 md:justify-between md:pt-10 lg:max-w-[1000px] lg:self-center">
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
        </div>
      </div>
    </section>
  );
}