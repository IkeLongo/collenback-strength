import Hero from "@/app/ui/home/hero";
import TextCarousel from "./lib/text-carosel";
import MeetCade from "@/app/ui/home/meet-cade";
import Qualifications from "@/app/ui/home/qualifications";
import Programs from "@/app/ui/home/programs";
import Testimonials from "@/app/ui/home/testimonials";
import Faq from "@/app/ui/home/faq";
import TrainWithCade from "@/app/ui/home/train-w-cade"
import Map from "@/app/ui/home/map";

const benchPress = "/assets/bench-press.lottie";
const strongman = "/assets/strongman.lottie";
const strongwoman = "/assets/strongwoman.lottie";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-start w-full h-auto">
      <main className="flex flex-col w-full h-full mx-4">
        <Hero />
        <TextCarousel 
          texts={["Train like an athlete", "Perform like a champion", "Push your limits"]}
          speed={15}
          className="w-full h-16 flex items-center bg-grey-700 border-y-2 border-white py-16"
          textClassName="text-[3.0rem] font-semibold text-white uppercase font-oxanium"
          gap="2rem"
          highlightWords={["athlete", "champion", "limits"]}
          highlightColor="text-gold-500 italic"
          showLottie={true}
          lottieSize={{ mobile: 200, md: 200, lg: 200 }}
          lottieFiles={[
            benchPress,
            strongman,
            strongwoman
          ]}
        />
        <MeetCade />
        <Qualifications />
        <Programs />
        <Testimonials />
        <Faq />
        <TrainWithCade />
        <Map />
      </main>
    </div>
  );
}
