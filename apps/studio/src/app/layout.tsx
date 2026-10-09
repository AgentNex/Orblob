import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Orblob Studio — Next-Gen WebGL2 Globe Visual Editor',
  description:
    'Design, customize, and export interactive WebGL2 globes for React, Next.js, Vue, Svelte, and Vanilla JS. Powered by InsForge BaaS.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface-primary text-text-primary antialiased font-sans overflow-hidden">
        {children}
      </body>
    </html>
  );
}
