import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SwiftLogistics — Reliable Parcel Delivery & Dispatch',
  description:
    'Web-based logistics and delivery management platform for customers, merchants, riders, and dispatch operations in Dutse, Jigawa State.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
