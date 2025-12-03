import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ThemeProvider } from '@/shared/theme/ThemeProvider';

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
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
