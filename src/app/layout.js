import './globals.css';
import './migration.css';
import Script from 'next/script';
import IntroOverlay from './components/IntroOverlay';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title:
    'adnanzeros (Adnan Sami) | Web Designer & Frontend Developer, Bangladesh',
  description:
    'adnanzeros (adnan zeros) is Adnan Sami, a web designer and frontend developer from Dhaka, Bangladesh. Official portfolio, projects and contact.',
  keywords: [
    'adnanzeros',
    'adnan zeros',
    'adnan sami',
    'web designer Bangladesh',
    'frontend developer Dhaka',
  ],
  authors: [{ name: 'Adnan Sami' }],
  metadataBase: new URL('https://adnanzeros.vercel.app'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'profile',
    locale: 'en_US',
    siteName: 'adnanzeros',
    title:
      'adnanzeros (Adnan Sami) | Web Designer & Frontend Developer, Bangladesh',
    description:
      'adnanzeros (adnan zeros) is Adnan Sami, a web designer and frontend developer from Dhaka, Bangladesh.',
    url: 'https://adnanzeros.vercel.app/',
    images: [
      {
        url: '/adnan2.webp',
        width: 920,
        height: 920,
        alt: 'Adnan Sami (adnanzeros), web designer from Bangladesh',
      },
    ],
    firstName: 'Adnan',
    lastName: 'Sami',
    username: 'adnanzeros',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@adnanzerosx',
    creator: '@adnanzerosx',
    title:
      'adnanzeros (Adnan Sami) | Web Designer & Frontend Developer, Bangladesh',
    description:
      'adnanzeros (adnan zeros) is Adnan Sami, a web designer and frontend developer from Dhaka, Bangladesh.',
    images: ['/adnan2.webp'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '48x48' },
    ],
    apple: '/apple-touch-icon.png',
  },
  other: {
    'geo.region': 'BD',
    'geo.placename': 'Dhaka, Bangladesh',
    'theme-color': '#000000',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <Script
          id="intro-session-bootstrap"
          src="/intro-session-bootstrap.js"
          strategy="beforeInteractive"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
        />
      </head>

      <body>
        <IntroOverlay />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
