import type { Metadata, Viewport } from "next";
import { DM_Sans, Playfair_Display, JetBrains_Mono } from "next/font/google";

import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

import { BreadcrumbSchema } from "@/components/breadcrumb-schema";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { WebVitalsReporter } from "@/components/web-vitals-reporter"

import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

// Light neutral to match default light UI.
const THEME_COLOR = "#f8fafc";

export const metadata: Metadata = {
  metadataBase: new URL("https://accidental-lease-ai.com"),
  applicationName: "AcciLease AI",
  title: {
    default: "AcciLease AI — Lease Generator + State Law Guide for Landlords",
    template: "%s | AcciLease AI",
  },
  description:
    "AI-assisted lease generator, contract review, and landlord-tenant law guides for all 50 states + DC. Built for accidental landlords who want state-aware leases and fewer legal mistakes.",
  keywords: [
    "lease generator",
    "lease agreement generator",
    "rental agreement",
    "lease analyzer",
    "contract review",
    "landlord tenant law",
    "landlord tenant laws by state",
    "accidental landlord",
    "security deposit laws",
    "eviction notice requirements",
  ],
  alternates: {
    canonical: "https://accidental-lease-ai.com",
    languages: {
      // Future-proofing: add en-GB / en-CA / en-AU when localized routes ship.
      en: "https://accidental-lease-ai.com",
    },
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "AcciLease AI — Lease Generator + State Law Guide",
    description:
      "Generate and review leases with state-aware guidance. Browse landlord-tenant laws for all 50 states + DC.",
    url: "https://accidental-lease-ai.com",
    siteName: "AcciLease AI",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AcciLease AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AcciLease AI — Lease Generator + State Law Guide",
    description:
      "Generate and review leases with state-aware guidance. Browse landlord-tenant laws for all 50 states + DC.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AcciLease",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
  colorScheme: "dark light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${playfair.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* 结构化数据 - WebSite (helps sitelinks search box where applicable) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "AcciLease AI",
              url: "https://accidental-lease-ai.com",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://accidental-lease-ai.com/landlord-tenant-laws?state={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />

        {/* 结构化数据 - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "AcciLease AI",
              "url": "https://accidental-lease-ai.com",
              "logo": "https://accidental-lease-ai.com/favicon.png",
              "description": "AI-assisted lease drafting and contract review for accidental landlords",
              "sameAs": [
                "https://twitter.com/accileaseai",
                "https://facebook.com/accileaseai",
                "https://linkedin.com/company/accileaseai"
              ]
            })
          }}
        />
        
        {/* 结构化数据 - WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "AcciLease AI",
              "url": "https://accidental-lease-ai.com",
              "description": "AI-powered lease drafting and contract review tool for accidental landlords",
              "operatingSystem": "All",
              "applicationCategory": "Productivity",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
              }
            })
          }}
        />
        
      </head>
      <body className="min-h-full flex flex-col">
        <BreadcrumbSchema />
        <WebVitalsReporter />
        <Providers>
          {/* Site marketing chrome (hidden on app-shell routes like /audit) */}
          <SiteHeader />
          {children}
          <SiteFooter />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
