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
    <html lang="en" style={{ height: '100%', margin: 0, padding: 0 }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ 
        height: '100vh', 
        margin: 0, 
        padding: 0, 
        overflow: 'hidden',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ 
          height: '100vh', 
          width: '100vw', 
          margin: 0, 
          padding: 0 
        }}>
          {children}
        </div>
      </body>
    </html>
  );
}