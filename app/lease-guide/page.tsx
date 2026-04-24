import Link from "next/link"
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lease Agreement Guide - How to Create a Legally Compliant Lease',
  description: 'Comprehensive guide to creating a legally compliant lease agreement, including essential clauses, state-specific requirements, and best practices for landlords.',
  keywords: [
    'lease agreement',
    'rental agreement',
    'lease drafting',
    'landlord lease template',
    'legally compliant lease',
    'lease clauses'
  ],
  alternates: {
    canonical: 'https://accidental-lease-ai.com/lease-guide',
  },
  openGraph: {
    title: 'Lease Agreement Guide - How to Create a Legally Compliant Lease',
    description: 'Comprehensive guide to creating a legally compliant lease agreement, including essential clauses, state-specific requirements, and best practices for landlords.',
    url: 'https://accidental-lease-ai.com/lease-guide',
    type: 'article',
    images: [
      {
        url: 'https://accidental-lease-ai.com/og-image-lease.png',
        width: 1200,
        height: 630,
        alt: 'Lease Agreement Guide'
      }
    ]
  }
};

export default function LeaseGuide() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Lease Agreement Guide</h1>
      
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
                "name": "Lease Guide"
              }
            ]
          })
        }}
      />
      
      {/* 结构化数据 - HowTo */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Create a Legally Compliant Lease Agreement",
            "description": "Step-by-step guide to creating a legally compliant lease agreement for rental properties",
            "step": [
              {
                "@type": "HowToStep",
                "name": "Include Basic Information",
                "text": "Start with basic information about the landlord, tenant, property, and lease term."
              },
              {
                "@type": "HowToStep",
                "name": "Add Essential Clauses",
                "text": "Include essential clauses such as rent amount, payment terms, security deposit, maintenance responsibilities, and termination procedures."
              },
              {
                "@type": "HowToStep",
                "name": "Comply with State Laws",
                "text": "Ensure the lease complies with state-specific laws regarding security deposits, late fees, eviction procedures, and other requirements."
              },
              {
                "@type": "HowToStep",
                "name": "Include Required Disclosures",
                "text": "Add any required disclosures, such as lead-based paint disclosure for pre-1978 housing."
              },
              {
                "@type": "HowToStep",
                "name": "Review and Sign",
                "text": "Carefully review the lease with the tenant and have both parties sign and date the agreement."
              }
            ]
          })
        }}
      />
      
      <div className="prose max-w-none">
        <p className="text-lg">
          A well-drafted lease agreement is essential for protecting both landlords and tenants. This guide will help you create a legally compliant lease that covers all necessary terms and conditions.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Essential Elements of a Lease Agreement</h2>
        <p>
          Every lease agreement should include these essential elements:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Parties Information</strong>: Names and contact information of the landlord and tenant(s)</li>
          <li><strong>Property Description</strong>: Address and detailed description of the rental property</li>
          <li><strong>Lease Term</strong>: Start and end dates of the lease, including renewal options</li>
          <li><strong>Rent Details</strong>: Amount, due date, payment methods, and late fees</li>
          <li><strong>Security Deposit</strong>: Amount, purpose, and return conditions</li>
          <li><strong>Maintenance Responsibilities</strong>: Who is responsible for what repairs and maintenance</li>
          <li><strong>Rules and Regulations</strong>: Property rules regarding pets, smoking, noise, etc.</li>
          <li><strong>Termination Procedures</strong>: How the lease can be terminated by either party</li>
          <li><strong>Eviction Procedures</strong>: Grounds for eviction and the legal process</li>
          <li><strong>Governing Law</strong>: Which state laws govern the lease</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">State-Specific Requirements</h2>
        <p>
          Lease agreements must comply with state-specific laws, including:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Security Deposit Limits</strong>: Many states limit how much landlords can charge</li>
          <li><strong>Required Disclosures</strong>: State-specific disclosures (e.g., lead-based paint, mold)</li>
          <li><strong>Late Fee Limits</strong>: Some states cap late fees</li>
          <li><strong>Eviction Procedures</strong>: State-specific notice requirements and processes</li>
          <li><strong>Landlord Entry</strong>: Notice requirements for landlord entry</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Recommended Clauses</h2>
        <p>
          In addition to the essential elements, consider including these recommended clauses:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Subletting and Assignment</strong>: Rules regarding subletting the property</li>
          <li><strong>Property Alterations</strong>: Rules regarding modifications to the property</li>
          <li><strong>Insurance Requirements</strong>: Whether tenants need renter's insurance</li>
          <li><strong>Utilities Responsibility</strong>: Who pays for which utilities</li>
          <li><strong>Parking Arrangements</strong>: Details about parking spaces</li>
          <li><strong>Storage Spaces</strong>: Information about storage areas</li>
          <li><strong>Renewal Terms</strong>: How and when the lease will be renewed</li>
          <li><strong>Dispute Resolution</strong>: Process for resolving disputes</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Lease Agreement Best Practices</h2>
        <p>
          Follow these best practices when creating a lease agreement:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Use clear, plain language that both parties can understand</li>
          <li>Be specific and detailed about all terms and conditions</li>
          <li>Comply with all federal, state, and local laws</li>
          <li>Keep a signed copy of the lease for your records</li>
          <li>Review and update your lease template regularly</li>
          <li>Consider having an attorney review your lease agreement</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Common Lease Mistakes to Avoid</h2>
        <p>
          Avoid these common mistakes when creating a lease agreement:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Using vague or ambiguous language</li>
          <li>Omitting essential clauses</li>
          <li>Not complying with state-specific laws</li>
          <li>Waiving important landlord rights</li>
          <li>Not including required disclosures</li>
          <li>Using outdated lease templates</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Resources</h2>
        <p>
          For more help with lease agreements:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><Link href="/landlord-tenant-laws" className="text-blue-600 hover:underline">State-specific landlord-tenant laws</Link></li>
          <li><Link href="/accidental-landlord-guide" className="text-blue-600 hover:underline">Accidental Landlord Guide</Link></li>
          <li><Link href="/features/lease-analyzer" className="text-blue-600 hover:underline">AI Lease Analyzer Tool</Link></li>
        </ul>
      </div>
    </div>
  );
}