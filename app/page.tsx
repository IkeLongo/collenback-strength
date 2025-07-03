import Image from "next/image";
import Hero from "@/app/ui/home/hero";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-start w-full h-auto">
      <main className="flex flex-col w-full h-full mx-4">
        <Hero />
      </main>
    </div>
  );
}
