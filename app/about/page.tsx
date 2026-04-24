import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - AcciLease AI',
  description: 'Learn about AcciLease AI, our mission to help accidental landlords navigate the complexities of property management with AI-powered tools.',
  keywords: [
    'about AcciLease AI',
    'accidental landlord',
    'AI lease drafting',
    'property management',
    'landlord tools'
  ],
  alternates: {
    canonical: 'https://accidental-lease-ai.com/about',
  },
  openGraph: {
    title: 'About Us - AcciLease AI',
    description: 'Learn about AcciLease AI, our mission to help accidental landlords navigate the complexities of property management with AI-powered tools.',
    url: 'https://accidental-lease-ai.com/about',
    type: 'website',
    images: [
      {
        url: 'https://accidental-lease-ai.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'About AcciLease AI'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us - AcciLease AI',
    description: 'Learn about AcciLease AI, our mission to help accidental landlords navigate the complexities of property management with AI-powered tools.',
    images: ['https://accidental-lease-ai.com/og-image.png']
  }
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">About AcciLease AI</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Empowering accidental landlords with AI-powered tools to simplify property management.
        </p>
      </div>

      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            AcciLease AI was founded with a simple mission: to make the journey of being an accidental landlord easier and less stressful. We understand that many people become landlords unexpectedly, whether through inheritance, relocation, or other life changes, and they often lack the knowledge and resources to navigate the complexities of property management.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Our AI-powered tools are designed to help accidental landlords create legally compliant lease agreements, review existing contracts, and stay informed about state-specific landlord-tenant laws. We believe that everyone should have access to affordable, reliable tools to protect their investment and maintain positive landlord-tenant relationships.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The idea for AcciLease AI came from our founder's personal experience as an accidental landlord. After inheriting a property and struggling to navigate the complex world of landlord-tenant laws and lease agreements, they realized there was a need for accessible, user-friendly tools to help others in similar situations.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            With a team of experienced developers, legal experts, and AI specialists, we set out to create a platform that would simplify the process of lease drafting and contract review. Our goal is to empower accidental landlords with the knowledge and tools they need to succeed, without the high cost of legal consultations.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-medium mb-2">Accessibility</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We believe that legal tools and resources should be accessible to everyone, regardless of their background or experience.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Accuracy</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We are committed to providing accurate, up-to-date information and tools that landlords can rely on.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Simplicity</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We design our tools to be simple and user-friendly, so landlords can focus on what matters most.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Empowerment</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We strive to empower landlords with the knowledge and tools they need to make informed decisions.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Have questions about AcciLease AI or our services? We'd love to hear from you!
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-1">Email</h3>
                <p className="text-gray-600 dark:text-gray-300">info@accidental-lease-ai.com</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-1">Phone</h3>
                <p className="text-gray-600 dark:text-gray-300">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-1">Address</h3>
                <p className="text-gray-600 dark:text-gray-300">123 Landlord Street, Suite 100, San Francisco, CA 94107</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 结构化数据 - Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            'name': 'AcciLease AI',
            'url': 'https://accidental-lease-ai.com',
            'logo': 'https://accidental-lease-ai.com/favicon.png',
            'description': 'Empowering accidental landlords with AI-powered tools to simplify property management.',
            'contactPoint': [
              {
                '@type': 'ContactPoint',
                'contactType': 'customer service',
                'email': 'info@accidental-lease-ai.com',
                'telephone': '+1 (555) 123-4567',
                'address': {
                  '@type': 'PostalAddress',
                  'streetAddress': '123 Landlord Street, Suite 100',
                  'addressLocality': 'San Francisco',
                  'addressRegion': 'CA',
                  'postalCode': '94107',
                  'addressCountry': 'US'
                }
              }
            ],
            'sameAs': [
              'https://twitter.com/accileaseai',
              'https://facebook.com/accileaseai',
              'https://linkedin.com/company/accileaseai'
            ]
          })
        }}
      />
    </div>
  );
}