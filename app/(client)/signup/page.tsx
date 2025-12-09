import { SignupForm } from "@/app/ui/signup/form";
import Image from "next/image";

export default function SignupPage() {
  return (
    <div className="w-full min-h-screen">
      {/* Top header section - only visible on mobile */}
      <div className="md:hidden relative pt-20">
        <div className="relative w-full h-[300px] pt-6 -mb-6">
          <Image
            src='/home-testimonials-bg.webp'
            alt='Background'
            fill
            className='object-cover opacity-50'
          />
          <div className="absolute inset-0 m-4 flex flex-col items-center justify-center">
            <h1 className="!text-[32px] pt-8 text-center text-white z-10 font-bold">Join Us</h1>
            <p className="text-center pt-4 text-white z-10">Start your strength journey today!</p>
          </div>
        </div>
      </div>

      {/* Main content grid - desktop layout */}
      <div className="grid md:grid-cols-2 w-full min-h-screen md:min-h-0">
        {/* Left side - desktop image */}
        <div className="hidden md:flex md:flex-col md:justify-center md:items-center w-full h-screen md:pt-24 lg:pt-32">
          <div className="w-full h-full relative flex justify-center items-center">
            <Image
              src='/home-testimonials-bg.webp'
              alt='Background'
              fill
              className='object-cover opacity-50 z-1'
            />
            <div className="absolute inset-0 mx-4 flex flex-col items-center justify-center bg-grey-700 bg-opacity-30">
              <h1 className="!text-4xl font-bold text-center text-white z-10">Join Us</h1>
              <p className="text-center pt-6 text-white text-lg z-10">Start your strength journey today!</p>
            </div>
          </div>
        </div>

        {/* Right side - form */}
        <div className="relative flex flex-col items-center justify-start md:justify-center bg-transparent rounded-t-[50px] md:rounded-none md:min-h-screen md:bg-white">
          {/* Layer 3 */}
          <div className="absolute -top-6 left-0 right-0 bottom-0 bg-gold-300 max-w-[535px] mx-auto rounded-t-[50px] md:hidden z-1" style={{ minHeight: 'calc(100vh + 100px)' }}></div>
          {/* Layer 2 */}
          <div className="absolute -top-3 left-0 right-0 bottom-0 bg-gold-500 max-w-[525px] mx-auto rounded-t-[50px] md:hidden z-2" style={{ minHeight: 'calc(100vh + 100px)' }}></div>
          {/* Layer 1 */}
          <div className="relative w-full bg-white max-w-[515px] md:max-w-none rounded-t-[50px] md:rounded-none z-10 min-h-full md:min-h-0 pt-0 md:pt-32">
            <SignupForm />
          </div>
        </div>
      </div>
    </div>
  );
}