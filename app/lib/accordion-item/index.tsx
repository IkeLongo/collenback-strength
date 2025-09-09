"use client";

import { useState, useRef, useEffect } from 'react';
import Image from "next/image";
import { Button } from "@heroui/button";
import Link from 'next/link';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import styles from './accordion-item.module.css';

interface AccordionItemProps {
  animation: string;
  iconDescription: string;
  title: string;
  description: string;
  className?: string;
}

export default function AccordionItem({ animation, iconDescription, title, description, className }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        // Set max-height to scrollHeight when opening
        contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px`;
      } else {
        // Set max-height to 0 when closing
        contentRef.current.style.maxHeight = '0px';
      }
    }
  }, [isOpen]);

  return (
    <div className={`flex flex-col w-full cursor-pointer hover-section ${className}`} onClick={toggleAccordion}>
      {/* Accordion Header */}
      <div className={`flex w-full py-[15px] px-[30px] justify-between transition-all duration-300 ${
        isOpen 
          ? 'border-transparent' 
          : 'border-b border-solid border-grey-300'
      } hover:text-gold-500 ${styles.hoverBounce}`}>
        
        <div className='flex min-h-8 gap-[10px] items-center'>
          <p className={`leading-7 font-bold !text-[18px] transition-colors duration-300 ${
            isOpen ? 'text-gold-500' : 'hover:text-gold-500'
          }`}>
            {title}
          </p>
        </div>
        
        <Image
          src={isOpen ? "/arrow-up.svg" : "/arrow-up.svg"}
          alt={isOpen ? "Collapse" : "Expand"}
          width={11.22}
          height={6.37}
          className={`object-contain transition-transform duration-300 w-[11.22px] h-[6.37px] md:w-[14px] md:h-[14px] lg:w-[16px] lg:h-[16px] ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
          style={{
            maxWidth: "100%",
            height: "auto"
          }} 
        />
      </div>
      
      {/* Accordion Content */}
      <div 
        ref={contentRef} 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${styles.accordionContent}`}
        style={{ maxHeight: isOpen ? 'none' : '0px' }}
      >
        <div className='flex flex-col p-[30px] gap-[30px] pt-0 justify-start border-b border-solid border-gold-500'>
          <p className='text-left leading-relaxed !text-[18px]'>
            {description}
          </p>
          {/* <Link href="/#plan" passHref scroll={false}>
            <Button className="w-[118px] h-[37px] font-maven-pro text-navy-500 text-sm font-semibold md:text-[14px] rounded-[20px] bg-alice-blue-500 hover:bg-alice-blue-600 transition-colors duration-200">
              View Pricing
            </Button>
          </Link> */}
        </div>
      </div>
    </div>
  );
}