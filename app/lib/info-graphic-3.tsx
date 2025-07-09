import React from 'react';
import { Button } from '@heroui/react';
import Image from 'next/image';

interface InfoGraphic3Props {
  icon: string;
  heading: string;
  subheading: string;
  description: string;
  buttonText: string;
  onButtonClick?: () => void;
  className?: string;
  iconSize?: number;
}

export default function InfoGraphic3({
  icon,
  heading,
  subheading,
  description,
  buttonText,
  onButtonClick,
  className = "",
  iconSize = 50
}: InfoGraphic3Props) {
  return (
    <div 
      className={`bg-grey-650 border border-grey-100 rounded-lg p-6 md:p-6 flex flex-col items-center text-center max-w-[300px] h-full gap-5 ${className}`}
    >
      {/* Icon */}
      <div className="flex justify-center">
        <Image
          src={icon}
          alt="Icon"
          width={iconSize}
          height={iconSize}
          className="object-contain"
        />
      </div>

      {/* Heading */}
      <p className="text-white font-semibold text-lg md:text-xl font-outfit">
        {heading}
      </p>

      {/* Subheading */}
      <p className="text-grey-100 font-medium text-base md:text-lg font-outfit">
        {subheading}
      </p>

      {/* Description - This will expand to fill available space */}
      <p className="text-grey-100 text-sm md:text-base leading-relaxed font-outfit flex-grow">
        {description}
      </p>

      {/* Gold Button - This will stick to bottom */}
      <Button
        onClick={onButtonClick}
        className="bg-gold-500 hover:bg-gold-600 text-grey-650 font-semibold py-2 px-6 rounded-lg transition-colors duration-200 font-outfit mt-auto cursor-pointer"
        style={{ 
          background: 'linear-gradient(180deg, #FFE98F 0%, #CB9F24 100%), #79DD1A' 
        }}
      >
        {buttonText}
      </Button>
    </div>
  );
}