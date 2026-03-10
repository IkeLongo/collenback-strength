import Hero from "@/app/components/layout/home/hero";
import TextCarousel from "../../components/ui/carousel/text-carosel";
import MeetCade from "@/app/components/layout/home/meet-cade";
import Qualifications from "@/app/components/layout/home/qualifications";
import Programs from "@/app/components/layout/home/programs";
import Testimonials from "@/app/components/layout/home/testimonials";
import Faq from "@/app/components/layout/home/faq";
import TrainWithCade from "@/app/components/layout/home/train-w-cade";
import Map from "@/app/components/layout/home/map";
import { ModalProvider } from "../../components/ui/modal/programs-modal";

const benchPress = "/assets/bench-press.lottie";
const strongman = "/assets/strongman.lottie";
const strongwoman = "/assets/strongwoman.lottie";

export default function Home() {
  return (
    <ModalProvider>
      <div className="flex flex-col items-center justify-start w-full h-auto">
        <main className="flex flex-col w-full h-full mx-4">
          <Hero />
          <TextCarousel 
            texts={["Cowards Never Start", "The Weak Never Finish", "The Strong Never Quit"]}
            speed={15}
            className="w-full h-16 flex items-center bg-grey-700 border-y-2 border-white py-16"
            textClassName="text-[3.0rem] font-semibold text-white uppercase font-oxanium"
            gap="2rem"
            highlightWords={["Cowards", "Weak", "Strong"]}
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
    </ModalProvider>
  );
}
