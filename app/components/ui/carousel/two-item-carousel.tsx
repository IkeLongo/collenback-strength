'use client';

import React, { useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

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

  const isCustomWidth = itemWidth !== undefined;

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      let pageIndex = 0;
      if (isCustomWidth) {
        const itemWidthNum = parseInt(itemWidth);
        const gapNum = parseInt(gap);
        const itemFullWidth = itemWidthNum + gapNum;
        pageIndex = Math.round(container.scrollLeft / (itemFullWidth * 2));
      } else {
        const itemWidth = container.clientWidth / 2;
        pageIndex = Math.round(container.scrollLeft / (itemWidth * 2));
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
          left: pageIndex * 2 * itemFullWidth,
          behavior: 'smooth'
        });
      } else {
        const itemWidth = container.clientWidth / 2;
        container.scrollTo({
          left: pageIndex * 2 * itemWidth,
          behavior: 'smooth'
        });
      }
    }
  };

  const getTotalPages = () => {
    return Math.ceil(children.length / 2);
  };

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

      {/* Desktop/Tablet: Centered container with explicit width */}
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