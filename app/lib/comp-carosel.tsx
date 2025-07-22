'use client';

import React, { useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'; // Add this at the top if using Heroicons

interface FullWidthCarouselProps {
  children: React.ReactNode[];
  className?: string;
  gap?: string;
  itemWidth?: string;
  dotPadding?: string; // New optional parameter for dot indicators padding
}

export default function FullWidthCarousel({
  children,
  className = "",
  gap = "16px",
  itemWidth,
  dotPadding = "16px" // Default padding between carousel and dots
}: FullWidthCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Determine if we're using custom item width or full width
  const isCustomWidth = itemWidth !== undefined;

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      
      if (isCustomWidth) {
        // Custom width: calculate based on item width + gap
        const itemWidthNum = parseInt(itemWidth);
        const gapNum = parseInt(gap);
        const itemFullWidth = itemWidthNum + gapNum;
        const scrollLeft = container.scrollLeft;
        const newIndex = Math.round(scrollLeft / itemFullWidth);
        setCurrentIndex(newIndex);
      } else {
        // Full width: use container width (existing behavior)
        const containerWidth = container.clientWidth;
        const scrollLeft = container.scrollLeft;
        const newIndex = Math.round(scrollLeft / containerWidth);
        setCurrentIndex(newIndex);
      }
    }
  };

  const scrollToItem = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      
      if (isCustomWidth) {
        // Custom width: scroll based on item width + gap
        const itemWidthNum = parseInt(itemWidth);
        const gapNum = parseInt(gap);
        const itemFullWidth = itemWidthNum + gapNum;
        container.scrollTo({
          left: index * itemFullWidth,
          behavior: 'smooth'
        });
      } else {
        // Full width: use container width (existing behavior)
        const containerWidth = container.clientWidth;
        container.scrollTo({
          left: index * containerWidth,
          behavior: 'smooth'
        });
      }
    }
  };

  // Calculate padding for centering when using custom width
  const getPadding = () => {
    if (isCustomWidth) {
      return `0 calc(50vw - ${itemWidth}/2)`;
    }
    return `0 ${gap}`;
  };

  // Calculate item width style
  const getItemWidth = () => {
    if (isCustomWidth) {
      return itemWidth;
    }
    return `calc(100% - ${gap})`;
  };

  return (
    <div className={`w-full relative ${className}`}>
      {/* Left Arrow */}
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-grey-700/80 hover:bg-grey-700 text-white rounded-full p-2 shadow transition disabled:opacity-40"
        onClick={() => scrollToItem(Math.max(currentIndex - 1, 0))}
        disabled={currentIndex === 0}
        aria-label="Previous"
        type="button"
      >
        <ChevronLeftIcon className="w-6 h-6" />
      </button>

      {/* Right Arrow */}
      <button
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-grey-700/80 hover:bg-grey-700 text-white rounded-full p-2 shadow transition disabled:opacity-40"
        onClick={() => scrollToItem(Math.min(currentIndex + 1, children.length - 1))}
        disabled={currentIndex === children.length - 1}
        aria-label="Next"
        type="button"
      >
        <ChevronRightIcon className="w-6 h-6" />
      </button>

      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ padding: getPadding() }}
        onScroll={handleScroll}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className="flex-shrink-0 snap-center my-6"
            style={{ 
              width: getItemWidth(),
              marginRight: index < children.length - 1 ? gap : "0"
            }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Dot Indicators with customizable padding */}
      <div 
        className="flex justify-center gap-2"
        style={{ marginTop: dotPadding }}
      >
        {children.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToItem(index)}
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              index === currentIndex ? 'bg-gold-500' : 'bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}