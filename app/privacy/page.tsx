import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - AcciLease AI',
  description: 'AcciLease AI privacy policy outlines how we collect, use, and protect your personal information when you use our services.',
  keywords: [
    'privacy policy',
    'data protection',
    'personal information',
    'AcciLease AI',
    'landlord tools'
  ],
  alternates: {
    canonical: 'https://accidental-lease-ai.com/privacy',
  },
  openGraph: {
    title: 'Privacy Policy - AcciLease AI',
    description: 'AcciLease AI privacy policy outlines how we collect, use, and protect your personal information when you use our services.',
    url: 'https://accidental-lease-ai.com/privacy',
    type: 'website',
    images: [
      {
        url: 'https://accidental-lease-ai.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AcciLease AI Privacy Policy'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy - AcciLease AI',
    description: 'AcciLease AI privacy policy outlines how we collect, use, and protect your personal information when you use our services.',
    images: ['https://accidental-lease-ai.com/og-image.png']
  }
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">Privacy Policy</h1>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="text-gray-600 dark:text-gray-300">
              AcciLease AI ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website and services.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-4">
              By using our website and services, you consent to the collection, use, and disclosure of your personal information as described in this Privacy Policy.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We collect the following types of information:
            </p>
            <h3 className="text-xl font-medium mb-2">Personal Information</h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mb-4">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number (optional)</li>
              <li>Payment information (when you subscribe to our premium services)</li>
            </ul>
            
            <h3 className="text-xl font-medium mb-2">Usage Information</h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mb-4">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages you visit on our website</li>
              <li>Time and date of your visits</li>
              <li>Time spent on each page</li>
              <li>Links you click on</li>
            </ul>
            
            <h3 className="text-xl font-medium mb-2">Lease and Property Information</h3>
            <p className="text-gray-600 dark:text-gray-300">
              When you use our lease drafting or analysis services, we may collect information about your property and lease agreements, including property address, rental terms, and tenant information.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We use your information for the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>To provide and improve our services</li>
              <li>To process your requests and transactions</li>
              <li>To communicate with you about our services</li>
              <li>To send you marketing and promotional materials (with your consent)</li>
              <li>To analyze usage patterns and improve our website</li>
              <li>To detect and prevent fraud</li>
              <li>To comply with legal requirements</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">How We Protect Your Information</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We take the protection of your personal information seriously. We implement a variety of security measures to protect your information, including:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>Encryption of sensitive data</li>
              <li>Secure server infrastructure</li>
              <li>Access controls to limit who can access your information</li>
              <li>Regular security audits and updates</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 mt-4">
              While we take reasonable measures to protect your information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee the absolute security of your information.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">Sharing Your Information</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We do not sell your personal information to third parties. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>With service providers who help us operate our website and services</li>
              <li>With legal authorities if required by law</li>
              <li>To protect our rights, property, or safety</li>
              <li>In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>The right to access your personal information</li>
              <li>The right to correct inaccurate information</li>
              <li>The right to delete your personal information</li>
              <li>The right to restrict processing of your information</li>
              <li>The right to data portability</li>
              <li>The right to object to processing of your information</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 mt-4">
              To exercise any of these rights, please contact us at info@accidental-lease-ai.com.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking Technologies</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We use cookies and other tracking technologies to improve your experience on our website. Cookies are small files that are stored on your device when you visit a website.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We use the following types of cookies:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>Essential cookies: These are necessary for the website to function properly</li>
              <li>Analytics cookies: These help us understand how users interact with our website</li>
              <li>Marketing cookies: These are used to personalize marketing content</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 mt-4">
              You can manage your cookie preferences through your browser settings. However, please note that disabling certain cookies may affect the functionality of our website.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Our website and services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will delete it immediately.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
            <p className="text-gray-600 dark:text-gray-300">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on our website. Your continued use of our website and services after any changes indicates your acceptance of the new Privacy Policy.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-300">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Email: info@accidental-lease-ai.com
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Address: 123 Landlord Street, Suite 100, San Francisco, CA 94107
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}