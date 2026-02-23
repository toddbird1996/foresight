import './globals.css';
import { Inter } from 'next/font/google';
import Header from './components/Header'; // <-- Import the Header

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'Foresight - Navigate Custody Battles with Confidence',
    template: '%s | Foresight'
  },
  description: 'Educational platform helping parents navigate custody court with step-by-step guides, AI assistance, and community support.',
  manifest: '/manifest.json',
  themeColor: '#0a0a0f',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Foresight'
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0a0f',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="application-name" content="Foresight" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Foresight" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
      </head>
      <body className={`${inter.className} bg-slate-950 text-white antialiased`}>
        <Header /> {/* <-- Add the global Header here */}
        <main>{children}</main>
      </body>
    </html>
  );
}
