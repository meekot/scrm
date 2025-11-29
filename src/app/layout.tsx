import type { Metadata } from 'next';
import { AppProviders } from '@/shared/providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'SCRM - Beauty Professional CRM',
  description: 'Mobile-first CRM for beauty professionals',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
