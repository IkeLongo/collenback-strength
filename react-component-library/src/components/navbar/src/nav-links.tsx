import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

// Place this at the top of your nav-links.tsx file
function smoothScrollToElement(element: HTMLElement, duration = 1000) {
  const navbarHeight = 40; // Adjust to your navbar's height in px
  const elementTop = element.getBoundingClientRect().top + window.scrollY;
  const targetY = elementTop - navbarHeight;
  const start = window.scrollY;
  const change = targetY - start;
  const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();

  function easeInOutQuad(t: number, b: number, c: number, d: number) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }

  function animateScroll() {
    const currentTime = 'now' in window.performance ? performance.now() : new Date().getTime();
    const timeElapsed = currentTime - startTime;
    const nextScroll = easeInOutQuad(timeElapsed, start, change, duration);
    window.scrollTo(0, nextScroll);
    if (timeElapsed < duration) {
      requestAnimationFrame(animateScroll);
    } else {
      window.scrollTo(0, targetY);
    }
  }

  requestAnimationFrame(animateScroll);
}

export type NavLink = {
  name: string;
  href: string;
  sectionId?: string;
};

export default function NavLinks({
  links,
  onClick,
}: {
  links: NavLink[];
  onClick: () => void;
}) {
  const pathname = usePathname(); // Current route path
  const router = useRouter();     // Next.js router for navigation
  const [activeSection, setActiveSection] = useState(''); // Tracks which section is active
  const [scrollIntent, setScrollIntent] = useState<string | null>(null); // <-- Add this line

  // Intersection Observer: watches sections on the homepage and updates activeSection
  useEffect(() => {
    // Only run observer on homepage
    if (pathname !== '/') return;

    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px', // Section is "active" when halfway in viewport
      threshold: 0
    };

    // Callback: sets activeSection to the id of the section in view
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(`#${entry.target.id}`);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Attach observer to each section element
    links.forEach((link) => {
      // Use sectionId if available, otherwise parse from href
      const id = link.sectionId || (link.href.startsWith('/#') ? link.href.slice(2) : link.href.slice(1));
      if (id) {
        const element = document.getElementById(id);
        if (element) {
          observer.observe(element);
        }
      }
    });

    // Cleanup observer on unmount or route change
    return () => observer.disconnect();
  }, [links, pathname]);

  // Scroll intent effect: when on home and scrollIntent is set, scroll to section
  useEffect(() => {
    if (pathname === '/' && scrollIntent) {
      const tryScroll = () => {
        const el = document.getElementById(scrollIntent);
        if (el) {
          smoothScrollToElement(el, 1000);
          setScrollIntent(null);
        } else {
          setTimeout(tryScroll, 100);
        }
      };
      tryScroll();
    }
  }, [pathname, scrollIntent]);

  // Determines if a nav link should be styled as "active"
  const isActiveLink = (href: string, sectionId?: string) => {
    // Normalize href for comparison with activeSection
    const normalizedHref = sectionId ? `#${sectionId}` : (href.startsWith('/#') ? href.replace('/', '') : href);
    // Active if section is in view OR if current route matches href
    return activeSection === normalizedHref || pathname === href;
  };

  // Updates activeSection when navigating to homepage with a hash (e.g. /#about)
  useEffect(() => {
    if (pathname === '/' && window.location.hash) {
      setActiveSection(window.location.hash);
    }
    // Clear activeSection when leaving homepage
    if (pathname !== '/') {
      setActiveSection('');
    }
  }, [pathname]);

  // Debug: log activeSection and pathname on change
  useEffect(() => {
    // console.log('activeSection:', activeSection);
    // console.log('pathname:', pathname);
  }, [activeSection, pathname]);

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.name}
          href={link.href}
          onClick={e => {
            const isHome = pathname === '/';
            const isHomeHashLink = link.href.startsWith('/#');
            // Use sectionId if available, otherwise parse from href
            const id = link.sectionId || link.href.replace('/#', '').replace('#', '');
            if (isHome && isHomeHashLink) {
              // Already on home: smooth scroll to section
              e.preventDefault();
              const el = document.getElementById(id);
              if (el) {
                smoothScrollToElement(el, 1000);
              }
              onClick?.();
            } else if (isHomeHashLink) {
              // Navigating from another page to home section
              e.preventDefault();
              setScrollIntent(id); // <-- Set scroll intent
              router.push('/');    // Go to home
              onClick?.();
              // Do NOT scroll here! The scrollIntent effect will handle it after navigation.
            } else {
              onClick?.();
            }
          }}
          className="flex h-[58px] grow font-outfit items-center justify-start md:justify-center gap-2 hover:font-bold md:flex-none md:justify-start md:p-2 md:px-3"
        >
          <p
            className={clsx(
              isActiveLink(link.href, link.sectionId)
                ? 'text-white font-bold! text-[24px]! font-outfit lg:text-[1.1rem]! uppercase!'
                : 'font-semibold hover:font-bold hover:text-white! uppercase text-grey-300! text-[24px]! lg:font-outfit! lg:text-[1.1rem]! lg:tracking-wider'
            )}
          >
            {link.name}
          </p>
        </Link>
      ))}
    </>
  );
}