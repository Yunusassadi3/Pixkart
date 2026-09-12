import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import BottomNav from "@/components/layout/BottomNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PIXKART | Mobile Accessories Megastore for Apple, Samsung, OnePlus & Pixel",
  description: "Shop premium mobile accessories on PixKart: 9H tempered glass, MagSafe back covers, TWS earphones, ANC headphones, 120W fast chargers, power banks & smartwatches for all mobile brands and series.",
  keywords: [
    "mobile accessories online India",
    "iPhone 16 Pro Max MagSafe cases",
    "Samsung Galaxy S24 Ultra back covers",
    "OnePlus 12 tempered glass",
    "Google Pixel 9 Pro clear case",
    "wireless ANC TWS earbuds",
    "120W GaN fast chargers",
    "smartwatch bands India",
    "mobile accessories by brand and series",
    "PIXKART",
    "PixKart"
  ],
  robots: "index, follow",
  metadataBase: new URL("https://pixkart.in"),
  openGraph: {
    title: "PIXKART | Mobile Accessories Megastore for Apple, Samsung, OnePlus & Pixel",
    description: "Shop premium mobile accessories on PixKart: cases, covers, 9H tempered glass, wireless ANC earbuds, 120W fast chargers, power banks & smartwatches for all mobile brands and series.",
    url: "https://pixkart.in",
    siteName: "PIXKART",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=1200&auto=format&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "PIXKART Mobile Accessories Megastore",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PIXKART | Mobile Accessories Megastore",
    description: "Premium cases, screen guards, TWS earbuds, fast chargers for all phone brands & series on PixKart.",
  },
  verification: {
    google: "google1aa895ed831d49d9",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/images/pixkart-icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable}`} suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://pixkart.in" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "OnlineStore",
              "name": "PIXKART",
              "url": "https://pixkart.in",
              "description": "India's premier online store for mobile accessories across all major smartphone brands and series.",
              "priceRange": "₹299 - ₹29999",
              "paymentAccepted": "Cash on Delivery"
            })
          }}
        />
      </head>
      <body className="font-sans bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white pb-16 md:pb-0" suppressHydrationWarning>
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <AppProvider>
          {children}
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
