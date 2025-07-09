import React from 'react';
import Image from 'next/image';

interface InfoGraphic2Props {
  title: string;
  description: string;
  fixedWidth?: string; // Optional fixed width
  className?: string;
  iconSize?: number;
}

export default function InfoGraphic2({
  title,
  description,
  fixedWidth,
  className = "",
  iconSize = 20
}: InfoGraphic2Props) {
  return (
    <div 
      className={`rounded-[10px] p-6 flex flex-col items-center text-center w-full ${className}`}
      style={{
        width: fixedWidth, // Only apply fixed width if provided
      }}
    >
      {/* Thunder Icon */}
      <div className="flex justify-center mb-4">
        <Image
          src="/thunder.svg"
          alt="Thunder icon"
          width={iconSize}
          height={iconSize}
          className="object-contain"
        />
      </div>

      {/* Yellow Title Bar */}
      <div className="bg-gold-500 text-white px-4 py-2 rounded-lg mb-4 w-full lg:w-auto min-h-[64px] lg:min-h-[48px] flex items-center justify-center">
        <h4 className="md:text-base font-outfit">
          {title}
        </h4>
      </div>

      {/* Description Text */}
      <p className="text-white font-outfit leading-relaxed">
        {description}
      </p>
    </div>
  );
}