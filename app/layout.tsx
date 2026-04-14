import type { Metadata } from 'next';
import { Fraunces, DM_Sans, JetBrains_Mono, Figtree } from 'next/font/google';
import { Toaster } from 'sonner';
import AuthProvider from '@/components/auth-provider';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
});

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TiewTrip',
  description: 'Group trip operating system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${figtree.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body suppressHydrationWarning className="antialiased min-h-screen flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-center" toastOptions={{
          style: {
            background: 'var(--color-ink)',
            color: 'var(--color-cream)',
            border: '1px solid var(--color-soft)',
            fontFamily: 'var(--font-body)',
          }
        }} />
      </body>
    </html>
  );
}
