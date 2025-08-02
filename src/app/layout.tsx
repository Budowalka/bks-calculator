import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics, GoogleTagManagerNoScript } from "@/components/analytics/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BKS Entreprenad - Räkna priset på stenläggning i Stockholm | Kostnadsfri offert",
  description: "Få en professionell offert för stenläggning på bara 3 minuter. Kostnadsfritt och utan förpliktelser. Betongplattor, marksten, asfalt - alla typer av stenläggning i Stockholm.",
  keywords: [
    "stenläggning Stockholm",
    "kostnadsfri offert stenläggning", 
    "pris stenläggning",
    "betongplattor pris",
    "marksten Stockholm",
    "asfalt pris",
    "stenläggning kalkylator",
    "BKS Entreprenad",
    "stenläggning företag Stockholm"
  ],
  authors: [{ name: "BKS Entreprenad" }],
  creator: "BKS Entreprenad",
  publisher: "BKS Entreprenad",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://bks-calculator.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "BKS Entreprenad - Räkna priset på stenläggning i Stockholm",
    description: "Få en professionell offert för stenläggning på bara 3 minuter. Kostnadsfritt och utan förpliktelser.",
    url: 'https://bks-calculator.vercel.app',
    siteName: 'BKS Stenläggningskalkylator',
    images: [
      {
        url: '/images/Stenlägning-färdig-projekt.jpg',
        width: 1200,
        height: 630,
        alt: 'Professionell stenläggning i Stockholm - BKS Entreprenad',
      },
    ],
    locale: 'sv_SE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "BKS Entreprenad - Räkna priset på stenläggning i Stockholm",
    description: "Få en professionell offert för stenläggning på bara 3 minuter. Kostnadsfritt och utan förpliktelser.",
    images: ['/images/Stenlägning-färdig-projekt.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code', // Replace with actual verification code
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <head>
        <GoogleAnalytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "BKS Äkeri AB",
              "image": "https://bks-calculator.vercel.app/images/Stenlägning-färdig-projekt.jpg",
              "description": "Professionell stenläggning i Stockholm. Kostnadsfria offerter på betongplattor, marksten, asfalt och alla typer av stenläggning.",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Stockholm",
                "addressCountry": "SE"
              },
              "telephone": "+46735757897",
              "url": "https://bks-calculator.vercel.app",
              "priceRange": "$$",
              "serviceArea": {
                "@type": "City",
                "name": "Stockholm"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Stenläggning Services",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service", 
                      "name": "Betongplattor",
                      "description": "Professionell läggning av betongplattor"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Marksten", 
                      "description": "Marksten läggning för alla typer av ytor"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Asfalt",
                      "description": "Asfaltering för upp- och infarter"
                    }
                  }
                ]
              },
              "potentialAction": {
                "@type": "UseAction",
                "target": "https://bks-calculator.vercel.app/kalkyl",
                "name": "Beräkna offert för stenläggning"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleTagManagerNoScript />
        {children}
      </body>
    </html>
  );
}
