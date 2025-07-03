import React from 'react';
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

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.name}
          href={link.href}
          onClick={onClick}
          className="flex h-[48px] grow font-outfit items-center justify-start md:justify-center gap-2 hover:font-bold md:flex-none md:justify-start md:p-2 md:px-3"
        >
          <p
            className={clsx(
              pathname === link.href
                ? 'text-white font-bold'
                : 'font-medium hover:font-bold text-grey-400'
            )}
          >
            {link.name}
          </p>
        </Link>
      ))}
    </>
  );
}