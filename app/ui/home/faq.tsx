import AccordionItem from "@/app/lib/accordion-item";

export default function Faq() {

  return (
    <section id="faq" className="flex flex-col w-full mx-auto py-12 md:pt-24 lg:pt-12">
      <h3 className="text-white font-bold text-center pt-4 md:text-3xl lg:text-4xl font-outfit mb-4">
        Commonly Asked Questions
      </h3>

      <div className="flex flex-col self-center mx-4 max-w-[600px]">
        <AccordionItem
          animation="/assets/faq-animation.lottie"
          iconDescription="FAQ"
          title="What is your return policy?"
          description="Our return policy is simple and straightforward. You can return any item within 30 days for a full refund."
        />
        <AccordionItem
          animation="/assets/faq-animation.lottie"
          iconDescription="FAQ"
          title="Do you offer international shipping?"
          description="Yes, we offer international shipping to select countries. Please check our shipping policy for more details."
        />
        <AccordionItem
          animation="/assets/faq-animation.lottie"
          iconDescription="FAQ"
          title="How can I track my order?"
          description="Once your order has shipped, you will receive an email with tracking information."
        />
        <AccordionItem
          animation="/assets/faq-animation.lottie"
          iconDescription="FAQ"
          title="How can I track my order?"
          description="Once your order has shipped, you will receive an email with tracking information."
        />
      </div>
    </section>
  );
}