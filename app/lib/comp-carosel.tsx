'use client';

import React, { useRef, useState } from 'react';

interface FullWidthCarouselProps {
  children: React.ReactNode[];
  className?: string;
  gap?: string;
}

export default function FullWidthCarousel({
  children,
  className = "",
  gap = "16px"
}: FullWidthCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const containerWidth = container.clientWidth;
      const scrollLeft = container.scrollLeft;
      const newIndex = Math.round(scrollLeft / containerWidth);
      setCurrentIndex(newIndex);
    }
  };

  const scrollToItem = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const containerWidth = container.clientWidth;
      container.scrollTo({
        left: index * containerWidth,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ padding: `0 ${gap}` }}
        onScroll={handleScroll}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className="flex-shrink-0 snap-center w-full"
            style={{ 
              marginRight: index < children.length - 1 ? gap : "0",
              width: `calc(100% - ${gap})`
            }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center mt-4 gap-2">
        {children.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToItem(index)}
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              index === currentIndex ? 'bg-gold-500' : 'bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}