import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features - AcciLease AI',
  description: 'Explore the powerful features of AcciLease AI, including AI-assisted lease drafting, contract review, and compliance with state-specific laws.',
  keywords: [
    'AI lease drafting',
    'contract review',
    'landlord tenant laws',
    'lease analyzer',
    'rental agreement generator'
  ],
  alternates: {
    canonical: 'https://accidental-lease-ai.com/features',
  },
  openGraph: {
    title: 'Features - AcciLease AI',
    description: 'Explore the powerful features of AcciLease AI, including AI-assisted lease drafting, contract review, and compliance with state-specific laws.',
    url: 'https://accidental-lease-ai.com/features',
    type: 'website',
    images: [
      {
        url: 'https://accidental-lease-ai.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AcciLease AI Features'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Features - AcciLease AI',
    description: 'Explore the powerful features of AcciLease AI, including AI-assisted lease drafting, contract review, and compliance with state-specific laws.',
    images: ['https://accidental-lease-ai.com/og-image.png']
  }
};

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for Accidental Landlords</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          AcciLease AI provides a comprehensive suite of tools to help you navigate the complexities of being a landlord.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold mb-4">AI-Powered Lease Drafting</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Generate legally compliant lease agreements tailored to your specific state's laws. Our AI system ensures all required clauses are included and up-to-date.
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
            <li>State-specific legal compliance</li>
            <li>Customizable terms and conditions</li>
            <li>Professional formatting</li>
            <li>Instant PDF generation</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Contract Review & Analysis</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Upload existing lease agreements for AI-powered analysis. Identify potential risks, missing clauses, and compliance issues.
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
            <li>Comprehensive risk assessment</li>
            <li>Missing clause identification</li>
            <li>Compliance check against state laws</li>
            <li>Detailed audit report</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold mb-4">State-Specific Legal Guidance</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Access detailed information about landlord-tenant laws in all 50 states and DC. Stay informed about your rights and responsibilities.
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
            <li>50 states + DC coverage</li>
            <li>Up-to-date legal information</li>
            <li>Key clauses for each state</li>
            <li>Legal resources and references</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold mb-4">User-Friendly Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Manage all your lease agreements and documents in one place. Track usage, access previous documents, and stay organized.
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
            <li>Document management</li>
            <li>Usage tracking</li>
            <li>Easy access to previous agreements</li>
            <li>Subscription management</li>
          </ul>
        </div>
      </div>

      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-semibold mb-4">Ready to Simplify Your Landlord Journey?</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Start using AcciLease AI today and experience the power of AI-assisted lease management.
        </p>
        <a 
          href="/" 
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Get Started
        </a>
      </div>

      {/* 结构化数据 - WebApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            'name': 'AcciLease AI Features',
            'url': 'https://accidental-lease-ai.com/features',
            'description': 'Explore the powerful features of AcciLease AI, including AI-assisted lease drafting, contract review, and compliance with state-specific laws.',
            'operatingSystem': 'All',
            'applicationCategory': 'Productivity',
            'offers': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'USD',
              'availability': 'https://schema.org/InStock'
            }
          })
        }}
      />
    </div>
  );
}