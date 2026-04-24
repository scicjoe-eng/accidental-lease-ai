import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lease Analyzer - AcciLease AI',
  description: 'AcciLease AI Lease Analyzer helps you review existing lease agreements, identify risks, and ensure compliance with state-specific laws.',
  keywords: [
    'lease analyzer',
    'contract review',
    'lease agreement analysis',
    'landlord tenant laws',
    'rental agreement review'
  ],
  alternates: {
    canonical: 'https://accidental-lease-ai.com/features/lease-analyzer',
  },
  openGraph: {
    title: 'Lease Analyzer - AcciLease AI',
    description: 'AcciLease AI Lease Analyzer helps you review existing lease agreements, identify risks, and ensure compliance with state-specific laws.',
    url: 'https://accidental-lease-ai.com/features/lease-analyzer',
    type: 'website',
    images: [
      {
        url: 'https://accidental-lease-ai.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AcciLease AI Lease Analyzer'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lease Analyzer - AcciLease AI',
    description: 'AcciLease AI Lease Analyzer helps you review existing lease agreements, identify risks, and ensure compliance with state-specific laws.',
    images: ['https://accidental-lease-ai.com/og-image.png']
  }
};

export default function LeaseAnalyzerPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">AI-Powered Lease Analyzer</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Upload your existing lease agreement for comprehensive AI analysis to identify risks and ensure legal compliance.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md mb-12">
        <h2 className="text-2xl font-semibold mb-6">How It Works</h2>
        <div className="space-y-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-4">
              <span className="text-indigo-600 dark:text-indigo-300 font-bold">1</span>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Upload Your Lease</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Upload your existing lease agreement in PDF format. Our system will securely process your document.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-4">
              <span className="text-indigo-600 dark:text-indigo-300 font-bold">2</span>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">AI Analysis</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our AI system will analyze your lease agreement, checking for compliance with state-specific laws and identifying potential risks.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-4">
              <span className="text-indigo-600 dark:text-indigo-300 font-bold">3</span>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Detailed Report</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Receive a comprehensive report highlighting risks, missing clauses, and compliance issues with recommendations for improvement.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-4">
              <span className="text-indigo-600 dark:text-indigo-300 font-bold">4</span>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Actionable Insights</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get specific recommendations to improve your lease agreement and ensure legal compliance.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-3">
            <li>Comprehensive risk assessment</li>
            <li>State-specific compliance check</li>
            <li>Missing clause identification</li>
            <li>Detailed audit report</li>
            <li>Actionable recommendations</li>
            <li>Secure document processing</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Benefits</h2>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-3">
            <li>Identify potential legal risks before they become issues</li>
            <li>Ensure compliance with state-specific landlord-tenant laws</li>
            <li>Save time and money on legal consultations</li>
            <li>Improve the quality and enforceability of your lease agreements</li>
            <li>Gain peace of mind knowing your lease is legally sound</li>
          </ul>
        </div>
      </div>

      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-semibold mb-4">Ready to Analyze Your Lease?</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Upload your lease agreement today and get a comprehensive analysis in minutes.
        </p>
        <a 
          href="/audit" 
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Try Lease Analyzer
        </a>
      </div>

      {/* 结构化数据 - WebApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            'name': 'AcciLease AI Lease Analyzer',
            'url': 'https://accidental-lease-ai.com/features/lease-analyzer',
            'description': 'AcciLease AI Lease Analyzer helps you review existing lease agreements, identify risks, and ensure compliance with state-specific laws.',
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