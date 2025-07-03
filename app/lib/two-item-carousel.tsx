'use client';

import React, { useRef, useState } from 'react';

interface TwoItemCarouselProps {
  children: React.ReactNode[];
  className?: string;
  gap?: string;
}

export default function TwoItemCarousel({
  children,
  className = "",
  gap = "16px"
}: TwoItemCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const itemWidth = container.clientWidth / 2; // Each item is half the container width
      const scrollLeft = container.scrollLeft;
      const newIndex = Math.round(scrollLeft / itemWidth);
      setCurrentIndex(newIndex);
    }
  };

  const scrollToItem = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const itemWidth = container.clientWidth / 2;
      container.scrollTo({
        left: index * itemWidth,
        behavior: 'smooth'
      });
    }
  };

  // Calculate total pages based on screen size
  const getTotalPages = () => {
    // On mobile: 1 item per page
    // On md+: 2 items per page, but scroll by 1
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      return Math.max(0, children.length - 1); // Can scroll through all items minus 1
    }
    return children.length; // Mobile shows 1 at a time
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Mobile: Full width carousel */}
      <div className="md:hidden">
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
      </div>

      {/* Desktop: Two items visible */}
      <div className="hidden md:block">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ padding: `0 ${gap}` }}
          onScroll={handleScroll}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className="flex-shrink-0 snap-start"
              style={{ 
                width: `calc(50% - ${gap}/2)`,
                marginRight: index < children.length - 1 ? gap : "0"
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center mt-4 gap-2">
        {Array.from({ length: getTotalPages() }, (_, index) => (
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