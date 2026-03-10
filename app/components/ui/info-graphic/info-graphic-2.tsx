"use client";

import React from 'react';
import Player from 'lottie-react';
import dumbellAnim from '../../../assets/dumbell.json';

interface InfoGraphic2Props {
  title: string;
  description: string;
  fixedWidth?: string; // Optional fixed width
  className?: string;
  animation?: object; // Optional animation prop for custom animations
  iconSize?: number;
}

export default function InfoGraphic2({
  title,
  description,
  fixedWidth,
  className = "",
  animation = dumbellAnim,
  iconSize = 20
}: InfoGraphic2Props) {
  return (
    <div 
      className={`rounded-[10px] p-6 pb-0 flex flex-col items-center text-center w-full ${className}`}
      style={{
        width: fixedWidth, // Only apply fixed width if provided
      }}
    >
      <div className="flex justify-center mb-4">
        <Player
          autoplay
          loop
          animationData={animation}
          style={{ width: iconSize, height: iconSize }}
        />
      </div>

      {/* Yellow Title Bar */}
      <div className="bg-gold-500 text-white px-4 py-2 rounded-lg mb-4 w-full lg:w-auto min-h-[64px] lg:min-h-[80px] flex items-center justify-center">
        <p className="md:text-base font-outfit font-semibold">
          {title}
        </p>
      </div>

      {/* Description Text */}
      <p className="text-white font-outfit leading-relaxed">
        {description}
      </p>
    </div>
  );
}