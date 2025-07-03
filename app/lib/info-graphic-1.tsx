'use client';

import React, { useState, useEffect, useRef } from 'react';

interface InfoGraphicProps {
  number: string | number;
  text: string;
  width?: string;
  className?: string;
  duration?: number; // Animation duration in milliseconds
}

export default function InfoGraphic({
  number,
  text,
  width = "200px",
  className = "",
  duration = 1500
}: InfoGraphicProps) {
  const [displayNumber, setDisplayNumber] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Extract numeric value from the number prop
  const getNumericValue = (value: string | number): number => {
    if (typeof value === 'number') return value;
    // Extract numbers from string (e.g., "150+" becomes 150, "24/7" becomes 24)
    const match = value.toString().match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  // Format the display number back to original format
  const formatNumber = (current: number): string => {
    if (typeof number === 'number') return current.toString();
    
    const originalStr = number.toString();
    if (originalStr.includes('+')) return `${current}+`;
    if (originalStr.includes('/')) {
      const parts = originalStr.split('/');
      return `${current}/${parts[1]}`;
    }
    if (originalStr.includes('%')) return `${current}%`;
    
    return current.toString();
  };

  const targetNumber = getNumericValue(number);

  // Intersection Observer to trigger animation when in view
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateNumber();
          
          // Disconnect observer after first animation
          if (observerRef.current && elementRef.current) {
            observerRef.current.unobserve(elementRef.current);
            observerRef.current.disconnect();
          }
        }
      },
      {
        threshold: 0.5, // Trigger when 50% of element is visible
        rootMargin: '0px 0px -100px 0px' // Trigger slightly before fully in view
      }
    );

    if (elementRef.current) {
      observerRef.current.observe(elementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []); // Remove hasAnimated from dependency array

  // Number animation function
  const animateNumber = () => {
    const startTime = Date.now();

    const updateNumber = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentNumber = Math.floor(easeOutQuart * targetNumber);

      setDisplayNumber(currentNumber);

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        setDisplayNumber(targetNumber);
      }
    };

    requestAnimationFrame(updateNumber);
  };

  return (
    <div 
      ref={elementRef}
      className={`bg-grey-650 rounded-[10px] p-4 flex flex-col items-center justify-center text-center ${className}`}
      style={{
        width: width,
        boxShadow: "0px 20px 40px 0px rgba(0, 0, 0, 0.10)"
      }}
    >
      {/* Animated Number */}
      <div className="text-yellow-500 font-anton text-[50px] md:text-5xl lg:text-[40px] lg:pb-2">
        {formatNumber(displayNumber)}
      </div>
      
      {/* Text */}
      <p 
        className="text-gray-100 font-outfit lg:text-[16px] md:text-base leading-relaxed"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </div>
  );
}