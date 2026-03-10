import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Content Management | Cade Collenback Strength',
  description: 'Content management system for Cade Collenback Strength website',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen m-0 p-0 overflow-x-hidden font-sans">
      <div className="h-screen w-full m-0 p-0">
        {children}
      </div>
    </div>
  );
}