"use client";

import React from "react";
import {
	Navbar as ResizeableNavbar,
	NavBody,
	NavItems,
	NavbarLogo,
	NavbarButton,
	MobileNav,
	MobileNavMenu,
	MobileNavHeader,
	MobileNavToggle,
} from "@/app/ui/layout/resizeable-navbar";
import Footer from "../layout/footer";

export default function PublicLayoutClient({ children }: { children: React.ReactNode }) {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
	const navItems = [
		{
			name: "Meet Cade",
			link: "/#about",
		},
		{
			name: "Programs",
			link: "/#programs",
		},
    {
			name: "Contact",
			link: "/contact",
		},
	];
	return (
		<div className="-mt-20">
			<ResizeableNavbar>
				{/* Desktop Navigation */}
				<NavBody>
					<NavbarLogo />
					<NavItems items={navItems} />
					<div className="flex items-center gap-4">
						<NavbarButton
              variant="primary"
              className="text-black!"
              href="/auth"
              >Login</NavbarButton>
					</div>
				</NavBody>

				{/* Mobile Navigation */}
				<MobileNav>
					<MobileNavHeader>
						<NavbarLogo />
						<MobileNavToggle
							isOpen={isMobileMenuOpen}
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						/>
					</MobileNavHeader>

					<MobileNavMenu
						isOpen={isMobileMenuOpen}
						onClose={() => setIsMobileMenuOpen(false)}
					>
						{navItems.map((item, idx) => (
							<a
								key={`mobile-link-${idx}`}
								href={item.link}
								onClick={() => setIsMobileMenuOpen(false)}
								className="relative text-lg! text-neutral-300"
							>
								<span className="block">{item.name}</span>
							</a>
						))}
						<div className="flex w-full flex-col gap-4">
							<NavbarButton
								onClick={() => setIsMobileMenuOpen(false)}
								variant="primary"
								className="w-full text-lg! text-black!"
                href="/auth"
							>
								Login
							</NavbarButton>
						</div>
					</MobileNavMenu>
				</MobileNav>
			</ResizeableNavbar>
			{children}
			<Footer />
		</div>
	);
}
