import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Content Management | Cade Collenback Strength',
  description: 'Content management system for Cade Collenback Strength website',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full m-0 p-0">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="h-screen m-0 p-0 overflow-x-hidden font-sans">
        <div className="h-screen w-screen m-0 p-0">
          {children}
        </div>
      </body>
    </html>
  );
}