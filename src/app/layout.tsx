import type { Metadata } from 'next';
import { Quicksand, Roboto } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { validateEnv } from '@/lib/env';

// Validate env vars at startup
validateEnv();

const quicksand = Quicksand({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['700'],
});

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'BeeGym Pro - Gestão para Personal Trainers',
  description: 'A ferramenta essencial para personal trainers que buscam profissionalismo e escala.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn(
        "transition-colors duration-200 antialiased",
        quicksand.variable,
        roboto.variable
      )}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
