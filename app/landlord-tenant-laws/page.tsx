import type { Metadata } from 'next';
import Link from "next/link"

import statesIndex from "@/app/data/states/index.json"

export const metadata: Metadata = {
  title: 'Landlord-Tenant Laws by State - Complete Guide',
  description: 'Comprehensive guide to landlord-tenant laws across all 50 states and DC, including security deposits, eviction procedures, rent control, and habitability requirements.',
  keywords: [
    'landlord tenant laws',
    'state rental laws',
    'security deposit laws',
    'eviction laws',
    'rent control',
    'habitability requirements'
  ],
  alternates: {
    canonical: 'https://accidental-lease-ai.com/landlord-tenant-laws',
  },
  openGraph: {
    title: 'Landlord-Tenant Laws by State - Complete Guide',
    description: 'Comprehensive guide to landlord-tenant laws across all 50 states and DC, including security deposits, eviction procedures, rent control, and habitability requirements.',
    url: 'https://accidental-lease-ai.com/landlord-tenant-laws',
    type: 'article',
    images: [
      {
        url: 'https://accidental-lease-ai.com/og-image-laws.png',
        width: 1200,
        height: 630,
        alt: 'Landlord-Tenant Laws by State'
      }
    ]
  }
};

export default function LandlordTenantLaws() {
  const states = statesIndex

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Landlord-Tenant Laws by State</h1>
      
      {/* 结构化数据 - BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://accidental-lease-ai.com/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Landlord-Tenant Laws"
              }
            ]
          })
        }}
      />
      
      <div className="prose max-w-none">
        <p className="text-lg">
          Landlord-tenant laws vary significantly from state to state. This guide provides an overview of key rental laws across all 50 states and the District of Columbia, including security deposit limits, eviction procedures, rent control policies, and habitability requirements.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Key Areas of Landlord-Tenant Law</h2>
        <p>
          When navigating landlord-tenant relationships, it's important to understand these key areas of the law:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Security Deposits</strong>: Limits, required interest, and return timelines</li>
          <li><strong>Eviction Procedures</strong>: Notice requirements and legal process</li>
          <li><strong>Rent Control</strong>: Limitations on rent increases</li>
          <li><strong>Habitability Requirements</strong>: Landlord obligations for property condition</li>
          <li><strong>Lease Agreements</strong>: Required terms and disclosures</li>
          <li><strong>Landlord Entry</strong>: Notice requirements and permissible reasons</li>
          <li><strong>Late Fees</strong>: Limits and requirements</li>
          <li><strong>Discrimination</strong>: Federal and state fair housing laws</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">State-Specific Laws</h2>
        <p>
          Click on your state below to view detailed information about landlord-tenant laws in your area:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {states.map((state) => (
            <Link
              key={state.stateSlug}
              href={`/landlord-tenant-laws/states/${state.stateSlug}`}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <h3 className="font-medium text-lg">{state.stateName}</h3>
            </Link>
          ))}
        </div>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Federal Laws</h2>
        <p>
          In addition to state laws, landlords and tenants must also comply with federal laws, including:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Fair Housing Act</strong>: Prohibits discrimination based on race, color, religion, sex, national origin, familial status, or disability</li>
          <li><strong>Lead-Based Paint Disclosure</strong>: Requires disclosure of lead-based paint hazards in pre-1978 housing</li>
          <li><strong>Americans with Disabilities Act (ADA)</strong>: Requires reasonable accommodations for tenants with disabilities</li>
          <li><strong>Uniform Residential Landlord and Tenant Act (URLTA)</strong>: A model law that many states have adopted in part</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Resources</h2>
        <p>
          For more information on landlord-tenant laws and best practices:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><Link href="/accidental-landlord-guide" className="text-blue-600 hover:underline">Accidental Landlord Guide</Link></li>
          <li><Link href="/lease-guide" className="text-blue-600 hover:underline">Lease Agreement Guide</Link></li>
          <li><Link href="/features/lease-analyzer" className="text-blue-600 hover:underline">AI Lease Analyzer Tool</Link></li>
        </ul>
      </div>
    </div>
  );
}