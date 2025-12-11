import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// import "../globals.css";
import "react-toastify/dist/ReactToastify.css";
import AuthLayoutClient from "./auth-layout-client";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

// export const metadata: Metadata = {
//   title: "Authentication | Cade Collenback Strength",
//   description: "Access your personal training account and fitness programs.",
// };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return <AuthLayoutClient>{children}</AuthLayoutClient>;
}
