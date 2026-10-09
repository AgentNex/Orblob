import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Orblob Documentation — Lightweight WebGL2 Interactive Globe',
  description:
    'Comprehensive documentation and API reference for Orblob: 5KB gzipped WebGL2 globe engine with native React, Vue, Svelte, and Vanilla integrations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface text-text antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
