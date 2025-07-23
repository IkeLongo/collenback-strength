"use client";

import React, { useState } from 'react';
import Image from "next/image";
import {Button, ButtonGroup} from "@heroui/button";
import Link from 'next/link';
import NavLinks, { NavLink } from './nav-links';
import MobileMenu from './mobile-menu';

const DEFAULT_LOGO = "/packages/navbar/assets/logo-rivercity-creatives-horizontal-green-white.png";

const DEFAULT_NAV_LINKS: NavLink[] = [
  { name: 'Why Choose Us?', href: '/#why' },
  { name: 'Pricing', href: '/#pricing' },
  { name: 'Services', href: '/services' },
  { name: 'Team', href: '/team' },
];

export type NavbarProps = {
  logoSrc?: string;
  navLinks?: NavLink[];
  showBookingButton?: boolean;
  showLoginButton?: boolean;
  bookingHref?: string;
  loginHref?: string;
  bookingText?: string;
  loginText?: string;
  backgroundColor?: string;
};

export default function Navbar({ 
  logoSrc,
  navLinks = DEFAULT_NAV_LINKS,
  showBookingButton = true,
  showLoginButton = false,
  bookingHref = "/booking",
  loginHref = "/login",
  bookingText = "Book a Call",
  loginText = "Login",
  backgroundColor = "bg-grey-650"
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentHref, setCurrentHref] = useState('/');

  const handleLogoClick = () => {
    setCurrentHref('/');
  };

  const resolvedLogoSrc = logoSrc || DEFAULT_LOGO;

  return (
    (<div className='fixed top-0 left-0 right-0 w-full z-50'>
      <div className="z-60">
        <MobileMenu 
          links={navLinks} 
          logoSrc={logoSrc}
          showBookingButton={showBookingButton}
          bookingHref={bookingHref}
          bookingText={bookingText}
          backgroundColor={backgroundColor}
        />
        <div className="flex items-center justify-center">
          <div className='hidden lg:w-full lg:max-w-[1200px] lg:flex lg:flex-col lg:pt-[30px] lg:justify-center lg:gap-[10px]'>
            <div className={`flex py-[13px] px-[20px] justify-between items-center self-stretch rounded-[30px] border-[1px] border-grey-500 bg-grey-700/50 ${backgroundColor}/0 backdrop-blur-[3.5px]`}>
              <Link className="cursor-pointer" href="/#hero" onClick={handleLogoClick}>
                <Image
                  src={resolvedLogoSrc}
                  alt="Logo"
                  width={60}
                  height={60}/>
              </Link>

              <div className="max-w-[1200px] flex lg:gap-6 justify-center">
                <NavLinks 
                  links={navLinks}
                  onClick={() => setMenuOpen(false)} // Close the menu when a link is clicked
                />
              </div>

              {showBookingButton && (
                <Button
                  onPress={() => setMenuOpen(false)} // Close the menu when the button is clicked
                  className="font-outfit text-grey-700 text-[14px] font-bold lg:font-normal rounded-[13px] bg-gradient-gold py-2 lg:uppercase lg:semibold"
                  style={{ 
                    background: 'linear-gradient(180deg, #FFE98F 0%, #CB9F24 100%), #79DD1A' 
                  }}
                >
                  <Link href={bookingHref} className="h-full flex items-center justify-center !text-grey-700 font-semibold uppercase font-outfit text-[1.1rem]! hover:font-bold!">
                    {bookingText}
                  </Link>
                </Button>
              )}
              {showLoginButton && (
                <Button
                  onPress={() => setMenuOpen(false)} // Close the menu when the button is clicked
                  className="font-outfit text-white text-[14px] font-bold lg:font-normal rounded-[13px] bg-gray-500 py-2 lg:text-[16px]">
                  <Link href={loginHref} className="h-full flex items-center justify-center">
                    {loginText}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>)
  );
}