import { ContactForm } from "../ui/contact/form";

export default function Home() {

  return (
    <div className="flex flex-col items-center justify-start w-full h-auto">
      <main className="flex flex-col w-full h-full mx-4">
        <ContactForm />
      </main>
    </div>
  );
}