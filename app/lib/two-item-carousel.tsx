'use client';

import React, { useRef, useState } from 'react';

interface TwoItemCarouselProps {
  children: React.ReactNode[];
  className?: string;
  containerWidth: string; // Required: total width of the carousel container
  gap?: string;
  itemWidth?: string;
  dotPadding?: string;
}

export default function TwoItemCarousel({
  children,
  className = "",
  containerWidth, // New required prop
  gap = "16px",
  itemWidth,
  dotPadding = "16px"
}: TwoItemCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Determine if we're using custom item width or default two-item behavior
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
        // Default behavior: Each item is half the container width
        const itemWidth = container.clientWidth / 2;
        const scrollLeft = container.scrollLeft;
        const newIndex = Math.round(scrollLeft / itemWidth);
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
        // Default behavior: scroll by half container width
        const itemWidth = container.clientWidth / 2;
        container.scrollTo({
          left: index * itemWidth,
          behavior: 'smooth'
        });
      }
    }
  };

  // Calculate total pages based on screen size and item width
  const getTotalPages = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      // Desktop: shows 2 items, scrolls 1 at a time
      // So total pages = total items minus 1
      return Math.max(0, children.length - 1);
    }
    // Mobile: one item per page
    return children.length;
  };

  // Calculate item width style
  const getItemWidthMobile = () => {
    if (isCustomWidth) {
      return itemWidth;
    }
    return `calc(100% - ${gap})`;
  };

  const getItemWidthDesktop = () => {
    if (isCustomWidth) {
      return itemWidth;
    }
    return `calc(50% - ${gap}/2)`;
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
              className="flex-shrink-0 snap-center"
              style={{ 
                width: getItemWidthMobile(),
                marginRight: index < children.length - 1 ? gap : "0"
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: Centered container with explicit width */}
      <div className="hidden md:flex md:justify-center">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ 
            width: containerWidth,
            padding: `0 ${gap}`,
            gap: gap
          }}
          onScroll={handleScroll}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className="flex-shrink-0 snap-start"
              style={{ 
                width: getItemWidthDesktop()
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Dot Indicators */}
      <div 
        className="flex justify-center gap-2"
        style={{ marginTop: dotPadding }}
      >
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