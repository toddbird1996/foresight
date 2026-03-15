import './globals.css';
import { Inter } from 'next/font/google';
import PWAInstall from './components/PWAInstall';
import BottomNav from './components/BottomNav';
import { ToastProvider } from './components/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'Foresight - Navigate Custody Battles with Confidence',
    template: '%s | Foresight'
  },
  description: 'Free self-help platform for Canadian parents navigating custody and family law. Filing guides, court forms, rights info, AI assistant, and community support across all 13 provinces.',
  manifest: '/manifest.json',
  keywords: ['custody', 'family law', 'Canada', 'self-represented', 'court forms', 'parenting plan', 'child support', 'filing guide', 'Saskatchewan', 'Alberta', 'Ontario', 'BC'],
  authors: [{ name: 'Foresight' }],
  creator: 'Foresight',
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    title: 'Foresight - Navigate Custody with Confidence',
    description: 'Free tools to help parents understand and navigate custody proceedings. Filing guides, court forms, rights by province, AI assistant, and peer support.',
    siteName: 'Foresight',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Foresight - Navigate Custody with Confidence',
    description: 'Free tools to help parents understand and navigate custody proceedings across Canada.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Foresight'
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="Foresight" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Foresight" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
      </head>
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <ToastProvider>
          <main className="pb-16 sm:pb-0">{children}</main>
          <BottomNav />
          <PWAInstall />
        </ToastProvider>
      </body>
    </html>
  );
}
