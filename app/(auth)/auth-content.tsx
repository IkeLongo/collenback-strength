'use client'

import { usePathname } from 'next/navigation';

interface AuthContentProps {
  isMobile?: boolean;
}

export default function AuthContent({ isMobile = false }: AuthContentProps) {
  const pathname = usePathname();
  
  const getContent = () => {
    if (pathname?.includes('/signup')) {
      return {
        title: 'Join Us',
        subtitle: 'Start your strength journey today!'
      };
    } else if (pathname?.includes('/login')) {
      return {
        title: 'Welcome Back',
        subtitle: 'Continue your strength journey!'
      };
    } else {
      // Default fallback
      return {
        title: 'Welcome',
        subtitle: 'Transform your fitness journey!'
      };
    }
  };

  const content = getContent();
  
  if (isMobile) {
    return (
      <>
        <h1 className="!text-[32px] text-center text-white z-10 font-bold">
          {content.title}
        </h1>
        <p className="text-center pt-4 text-white z-10">
          {content.subtitle}
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="!text-4xl font-bold text-center text-white z-10">
        {content.title}
      </h1>
      <p className="text-center pt-6 text-white text-lg z-10">
        {content.subtitle}
      </p>
    </>
  );
}