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
  backgroundColor = "bg-navy-500"
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
          <div className='hidden md:w-[900px] md:flex md:flex-col md:pt-[30px] md:justify-center md:gap-[10px]'>
            <div className={`flex py-[13px] px-[20px] justify-between items-center self-stretch rounded-[30px] border-[1px] ${backgroundColor}/75 backdrop-blur-[3.5px]`}>
              <Link href="/" onClick={handleLogoClick}>
                <Image
                  src={resolvedLogoSrc}
                  alt="Logo"
                  width={125}
                  height={100}/>
              </Link>
              <NavLinks 
                links={navLinks}
                onClick={() => setMenuOpen(false)} // Close the menu when a link is clicked
              />
              {showBookingButton && (
                <Button
                  onPress={() => setMenuOpen(false)} // Close the menu when the button is clicked
                  className="font-outfit text-grey-700 text-[14px] font-bold lg:font-normal rounded-[13px] bg-gradient-gold py-2 lg:text-[16px]"
                  style={{ 
                    background: 'linear-gradient(180deg, #FFE98F 0%, #CB9F24 100%), #79DD1A' 
                  }}
                >
                  <Link href={bookingHref} className="h-full flex items-center justify-center">
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