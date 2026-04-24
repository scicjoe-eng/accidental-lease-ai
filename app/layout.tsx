import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { BreadcrumbSchema } from "@/components/breadcrumb-schema";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader, type SiteHeaderUser } from "@/components/site/site-header";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Light neutral to match default light UI.
const THEME_COLOR = "#f8fafc";

export const metadata: Metadata = {
  metadataBase: new URL("https://accidental-lease-ai.com"),
  applicationName: "AcciLease AI",
  title: {
    default: "AcciLease AI",
    template: "%s | AcciLease AI",
  },
  description: "AI-assisted lease tools for accidental landlords.",
  alternates: {
    canonical: "https://accidental-lease-ai.com",
    languages: {
      // Future-proofing: add en-GB / en-CA / en-AU when localized routes ship.
      en: "https://accidental-lease-ai.com",
    },
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "AcciLease AI",
    description: "AI-assisted lease tools for accidental landlords.",
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
    title: "AcciLease AI",
    description: "AI-assisted lease tools for accidental landlords.",
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
  const headerUser: SiteHeaderUser | null = null

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
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
        <Providers>
          {/* Site marketing chrome (hidden on app-shell routes like /audit) */}
          <SiteHeader user={headerUser} />
          {children}
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
