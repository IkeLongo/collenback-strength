import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavLink = {
  name: string;
  href: string;
};

export default function NavLinks({
  links,
  onClick,
}: {
  links: NavLink[];
  onClick: () => void;
}) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(`#${entry.target.id}`);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all sections with IDs that match nav links
    links.forEach((link) => {
      if (link.href.startsWith('#')) {
        const element = document.getElementById(link.href.slice(1));
        if (element) {
          observer.observe(element);
        }
      }
    });

    return () => observer.disconnect();
  }, [links]);

  const isActiveLink = (href: string) => {
    if (href.startsWith('#')) {
      return activeSection === href;
    }
    return pathname === href;
  };

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.name}
          href={link.href}
          onClick={onClick}
          className="flex h-[58px] grow font-outfit items-center justify-start md:justify-center gap-2 hover:font-bold md:flex-none md:justify-start md:p-2 md:px-3"
        >
          <p
            className={clsx(
              isActiveLink(link.href)
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