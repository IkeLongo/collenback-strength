'use client';

import React, { useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface ThreeItemCarouselProps {
  children: React.ReactNode[];
  className?: string;
  containerWidth: string;
  gap?: string;
  itemWidth?: string;
  dotPadding?: string;
}

export default function ThreeItemCarousel({
  children,
  className = "",
  containerWidth,
  gap = "16px",
  itemWidth,
  dotPadding = "16px"
}: ThreeItemCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isCustomWidth = itemWidth !== undefined;

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      let pageIndex = 0;
      if (isCustomWidth) {
        const itemWidthNum = parseInt(itemWidth);
        const gapNum = parseInt(gap);
        const itemFullWidth = itemWidthNum + gapNum;
        pageIndex = Math.round(container.scrollLeft / (itemFullWidth * 3));
      } else {
        const itemWidth = container.clientWidth / 3;
        pageIndex = Math.round(container.scrollLeft / (itemWidth * 3));
      }
      setCurrentIndex(pageIndex);
    }
  };

  const scrollToItem = (pageIndex: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      if (isCustomWidth) {
        const itemWidthNum = parseInt(itemWidth);
        const gapNum = parseInt(gap);
        const itemFullWidth = itemWidthNum + gapNum;
        container.scrollTo({
          left: pageIndex * 3 * itemFullWidth,
          behavior: 'smooth'
        });
      } else {
        const itemWidth = container.clientWidth / 3;
        container.scrollTo({
          left: pageIndex * 3 * itemWidth,
          behavior: 'smooth'
        });
      }
    }
  };

  const getTotalPages = () => {
    return Math.ceil(children.length / 3);
  };

  const getItemWidthDesktop = () => {
    if (isCustomWidth) {
      return itemWidth;
    }
    return `calc(33.3333% - ${gap}/1.5)`;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop: Centered container with explicit width */}
      <div className="hidden lg:flex lg:justify-center">
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

      {/* Navigation: Arrows + Dots */}
      <div
        className="flex items-center justify-center gap-4 pt-8"
        style={{ marginTop: dotPadding }}
      >
        {/* Left Arrow */}
        <button
          className="bg-grey-700/80 hover:bg-grey-700 text-white rounded-full p-2 shadow transition disabled:opacity-40"
          onClick={() => scrollToItem(Math.max(currentIndex - 1, 0))}
          disabled={currentIndex === 0}
          aria-label="Previous"
          type="button"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>

        {/* Dot Indicators */}
        <div className="flex gap-2">
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

        {/* Right Arrow */}
        <button
          className="bg-grey-700/80 hover:bg-grey-700 text-white rounded-full p-2 shadow transition disabled:opacity-40"
          onClick={() => scrollToItem(Math.min(currentIndex + 1, getTotalPages() - 1))}
          disabled={currentIndex === getTotalPages() - 1}
          aria-label="Next"
          type="button"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}