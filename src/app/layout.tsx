import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Daily Win — Dein Dankbarkeits- & Fortschrittsjournal',
  description:
    'Baue Dankbarkeit und Bewusstsein für deinen täglichen Fortschritt auf — entspannt, ohne Druck.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Daily Win',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#fefdfb',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        <main className="min-h-screen">
          {children}
        </main>
        <Navigation />
      </body>
    </html>
  );
}
