import AccordionItem from "@/app/lib/accordion-item";

export default function Faq() {

  return (
    <section id="faq" className="flex flex-col w-full mx-auto py-16 md:py-18 lg:py-24">
      <h3 className="text-white font-bold text-center pt-4 md:text-3xl lg:text-4xl font-outfit mb-4">
        Commonly Asked Questions
      </h3>

      <div className="flex flex-col self-center mx-4 max-w-[600px]">
        <AccordionItem
          animation="/assets/faq-animation.lottie"
          iconDescription="FAQ"
          title="Do you only train athletes?"
          description="Not at all. While my background is rooted in athletics, I work with clients of all ages and fitness levels—including special populations. My goal is to help anyone, athlete or not, reach their strength and health goals."
        />

        <AccordionItem
          animation="/assets/faq-animation.lottie"
          iconDescription="FAQ"
          title="How long do training sessions last?"
          description="Sessions typically run 45–60 minutes depending on your goals and training style. Each workout is designed to maximize efficiency and ensure steady progress."
        />

        <AccordionItem
          animation="/assets/faq-animation.lottie"
          iconDescription="FAQ"
          title="Can I still train online with limited equipment?"
          description="Absolutely. I’ll build your program around whatever equipment you have—even just bodyweight movements like push-ups, squats, and running—to make sure you keep progressing."
        />

        <AccordionItem
          animation="/assets/faq-animation.lottie"
          iconDescription="FAQ"
          title="What can I expect when training with you?"
          description="Training goes beyond sets and reps. My coaching emphasizes accountability, grit, positivity, and confidence—helping you build not just physical strength, but also mental resilience."
        />

        <AccordionItem
          animation="/assets/faq-animation.lottie"
          iconDescription="FAQ"
          title="What’s the difference between in-person, online, and standardized programs?"
          description="In-person training provides hands-on coaching and real-time feedback. Online training offers custom programs, video breakdowns, and flexible support. Standardized programs are affordable, ready-made options for specific goals."
        />

        <AccordionItem
          animation="/assets/faq-animation.lottie"
          iconDescription="FAQ"
          title="How do online clients stay accountable?"
          description="Through regular check-ins, video feedback, and open communication. My clients know they can reach me anytime for guidance and motivation."
        />

        <AccordionItem
          animation="/assets/faq-animation.lottie"
          iconDescription="FAQ"
          title="I’m new to training. Can I still work with you?"
          description="100%. No experience is needed—just a willingness to learn. I’ll meet you at your current level and help you progress safely and effectively."
        />

        <AccordionItem
          animation="/assets/faq-animation.lottie"
          iconDescription="FAQ"
          title="Do you offer nutrition and supplement guidance?"
          description="Yes. Alongside training, I provide advice on nutrition, recovery, and supplementation to help you maximize results inside and outside the gym."
        />

        <AccordionItem
          animation="/assets/faq-animation.lottie"
          iconDescription="FAQ"
          title="What’s your coaching philosophy?"
          description="I believe in the power of small wins that add up to big results. My process-driven approach is about consistent progress, cultivating discipline, and helping clients discover their inner toughness."
        />
      </div>
    </section>
  );
}