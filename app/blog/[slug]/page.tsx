import Link from "next/link"
import { Metadata, ResolvingMetadata } from 'next';
import type { ReactElement } from "react"

// 模拟博客文章数据
const blogPosts = {
  'how-to-become-a-landlord': {
    title: 'How to Become a Landlord: A Step-by-Step Guide for Accidental Landlords',
    excerpt: 'Learn the essential steps to become a successful landlord, from understanding legal requirements to managing your property effectively.',
    content: `
      <p>Becoming a landlord can be an unexpected journey, especially if you've inherited a property or need to rent out your home due to relocation. This guide will walk you through the essential steps to become a successful accidental landlord.</p>
      
      <h2>1. Understand Your Legal Obligations</h2>
      <p>Before renting out your property, it's crucial to understand your legal obligations as a landlord. This includes:</p>
      <ul>
        <li>Complying with state and local landlord-tenant laws</li>
        <li>Understanding fair housing regulations</li>
        <li>Meeting safety and habitability standards</li>
        <li>Knowing your rights and responsibilities</li>
      </ul>
      
      <h2>2. Prepare Your Property</h2>
      <p>To attract quality tenants, your property should be clean, safe, and well-maintained. Consider:</p>
      <ul>
        <li>Making necessary repairs and upgrades</li>
        <li>Ensuring all appliances are in working order</li>
        <li>Installing smoke detectors and carbon monoxide detectors</li>
        <li>Creating a welcoming environment</li>
      </ul>
      
      <h2>3. Set a Competitive Rent</h2>
      <p>Research the local rental market to set a competitive rent price. Consider:</p>
      <ul>
        <li>Comparing similar properties in your area</li>
        <li>Factoring in your expenses (mortgage, taxes, insurance, maintenance)</li>
        <li>Setting a price that attracts tenants while covering your costs</li>
      </ul>
      
      <h2>4. Create a Legally Compliant Lease Agreement</h2>
      <p>A well-drafted lease agreement is essential for protecting both you and your tenants. It should include:</p>
      <ul>
        <li>Rent amount and payment terms</li>
        <li>Lease duration and renewal terms</li>
        <li>Security deposit amount and terms</li>
        <li>Tenant and landlord responsibilities</li>
        <li>Pet policies (if applicable)</li>
        <li>Eviction procedures</li>
      </ul>
      
      <h2>5. Screen Potential Tenants</h2>
      <p>Thorough tenant screening is crucial for finding reliable renters. Consider:</p>
      <ul>
        <li>Conducting background checks</li>
        <li>Verifying employment and income</li>
        <li>Checking rental history and references</li>
        <li>Ensuring the tenant can afford the rent</li>
      </ul>
      
      <h2>6. Maintain the Property</h2>
      <p>Regular maintenance is essential for keeping your property in good condition and retaining tenants. This includes:</p>
      <ul>
        <li>Addressing repair requests promptly</li>
        <li>Conducting regular inspections</li>
        <li>Keeping the property clean and well-maintained</li>
        <li>Planning for major repairs and upgrades</li>
      </ul>
      
      <h2>7. Handle Finances Properly</h2>
      <p>Good financial management is key to being a successful landlord. Consider:</p>
      <ul>
        <li>Setting up a separate bank account for rental income and expenses</li>
        <li>Keeping detailed records of all transactions</li>
        <li>Understanding tax implications and deductions</li>
        <li>Planning for unexpected expenses</li>
      </ul>
      
      <h2>8. Build a Positive Relationship with Tenants</h2>
      <p>A positive landlord-tenant relationship can lead to longer tenancies and fewer issues. Consider:</p>
      <ul>
        <li>Communicating clearly and promptly</li>
        <li>Being respectful and professional</li>
        <li>Addressing concerns in a timely manner</li>
        <li>Being flexible when possible</li>
      </ul>
      
      <p>By following these steps, you can navigate the journey of being an accidental landlord with confidence. Remember, being a landlord is a responsibility, but it can also be a rewarding experience when done right.</p>
    `,
    date: '2024-01-15',
    author: 'AcciLease AI Team',
    category: 'Landlord Tips'
  },
  'understanding-lease-agreements': {
    title: 'Understanding Lease Agreements: Key Components Every Landlord Should Know',
    excerpt: 'Discover the essential components of a legally compliant lease agreement and how to protect your rights as a landlord.',
    content: `
      <p>A lease agreement is a legally binding contract between a landlord and tenant that outlines the terms and conditions of the rental arrangement. Understanding the key components of a lease agreement is essential for protecting your rights as a landlord and ensuring a smooth rental experience.</p>
      
      <h2>1. Basic Information</h2>
      <p>Every lease agreement should include basic information about the landlord, tenant, and property:</p>
      <ul>
        <li>Names and contact information of both parties</li>
        <li>Property address and description</li>
        <li>Lease term (start and end dates)</li>
        <li>Rent amount and payment terms</li>
      </ul>
      
      <h2>2. Rent and Security Deposit</h2>
      <p>Clear terms regarding rent and security deposit are crucial:</p>
      <ul>
        <li>Monthly rent amount</li>
        <li>Due date for rent payments</li>
        <li>Accepted payment methods</li>
        <li>Late fee policy</li>
        <li>Security deposit amount</li>
        <li>Conditions for security deposit return</li>
      </ul>
      
      <h2>3. Tenant and Landlord Responsibilities</h2>
      <p>Both parties have specific responsibilities outlined in the lease:</p>
      <h3>Tenant Responsibilities:</h3>
      <ul>
        <li>Paying rent on time</li>
        <li>Keeping the property clean and well-maintained</li>
        <li>Reporting maintenance issues promptly</li>
        <li>Not disturbing other tenants</li>
        <li>Complying with all rules and regulations</li>
      </ul>
      
      <h3>Landlord Responsibilities:</h3>
      <ul>
        <li>Providing a safe and habitable property</li>
        <li>Making necessary repairs</li>
        <li>Respecting tenant privacy</li>
        <li>Complying with all applicable laws</li>
      </ul>
      
      <h2>4. Rules and Regulations</h2>
      <p>Lease agreements often include specific rules and regulations:</p>
      <ul>
        <li>Pet policies</li>
        <li>Smoking policies</li>
        <li>Noise restrictions</li>
        <li>Guest policies</li>
        <li>Parking rules</li>
      </ul>
      
      <h2>5. Termination and Renewal</h2>
      <p>Terms regarding lease termination and renewal should be clearly stated:</p>
      <ul>
        <li>Notice period for termination</li>
        <li>Conditions for early termination</li>
        <li>Renewal options</li>
        <li>Rent increase policies</li>
      </ul>
      
      <h2>6. Legal Disclosures</h2>
      <p>Depending on your state, you may be required to include specific legal disclosures:</p>
      <ul>
        <li>Lead-based paint disclosure (for properties built before 1978)</li>
        <li>Mold disclosure</li>
        <li>Pest control disclosure</li>
        <li>Smoke detector and carbon monoxide detector information</li>
      </ul>
      
      <h2>7. Dispute Resolution</h2>
      <p>Having a process for resolving disputes can help avoid legal issues:</p>
      <ul>
        <li>Mediation procedures</li>
        <li>Arbitration clauses</li>
        <li>Governing law</li>
      </ul>
      
      <p>A well-drafted lease agreement is essential for protecting both landlords and tenants. By including these key components, you can create a clear, comprehensive lease that helps prevent misunderstandings and legal disputes.</p>
    `,
    date: '2024-01-10',
    author: 'AcciLease AI Team',
    category: 'Lease Agreements'
  },
  'state-specific-landlord-laws': {
    title: 'State-Specific Landlord Laws: What You Need to Know',
    excerpt: 'Navigate the complex landscape of state-specific landlord-tenant laws to ensure compliance and protect your investment.',
    content: `
      <p>Landlord-tenant laws vary significantly from state to state, and understanding these differences is crucial for ensuring compliance and protecting your investment. This guide will help you navigate the complex landscape of state-specific landlord laws.</p>
      
      <h2>1. Security Deposit Laws</h2>
      <p>Security deposit laws vary widely by state:</p>
      <ul>
        <li><strong>Maximum deposit amount:</strong> Some states limit the security deposit to one or two months' rent, while others have no limit.</li>
        <li><strong>Interest requirements:</strong> Some states require landlords to pay interest on security deposits.</li>
        <li><strong>Return timeline:</strong> States have different requirements for how quickly landlords must return security deposits after a tenancy ends.</li>
        <li><strong>Deduction rules:</strong> States have specific rules about what landlords can deduct from security deposits.</li>
      </ul>
      
      <h2>2. Eviction Procedures</h2>
      <p>Eviction laws are highly state-specific:</p>
      <ul>
        <li><strong>Notice requirements:</strong> States have different notice periods for different types of evictions.</li>
        <li><strong>Eviction grounds:</strong> The reasons for which a landlord can evict a tenant vary by state.</li>
        <li><strong>Legal process:</strong> The steps landlords must follow to evict a tenant differ by state.</li>
        <li><strong>Retaliation laws:</strong> Most states prohibit landlords from evicting tenants in retaliation for exercising their legal rights.</li>
      </ul>
      
      <h2>3. Rent Control</h2>
      <p>Rent control laws exist in some states and cities:</p>
      <ul>
        <li><strong>States with rent control:</strong> California, New York, New Jersey, and Oregon have statewide rent control laws.</li>
        <li><strong>Local rent control:</strong> Some cities in other states have their own rent control ordinances.</li>
        <li><strong> Rent increase limits:</strong> Rent control laws typically limit how much landlords can increase rent each year.</li>
      </ul>
      
      <h2>4. Habitability Standards</h2>
      <p>All states have habitability standards, but the specifics vary:</p>
      <ul>
        <li><strong>Basic requirements:</strong> All states require landlords to provide safe, habitable housing.</li>
        <li><strong>Specific standards:</strong> States may have specific requirements for heating, plumbing, electrical systems, and more.</li>
        <li><strong>Repair responsibilities:</strong> States have different rules about how quickly landlords must make repairs.</li>
        <li><strong>Tenant remedies:</strong> States provide different remedies for tenants when landlords fail to maintain habitable conditions.</li>
      </ul>
      
      <h2>5. Discrimination Laws</h2>
      <p>While federal law prohibits discrimination based on race, color, religion, sex, national origin, familial status, and disability, some states have additional protections:</p>
      <ul>
        <li><strong>Additional protected classes:</strong> Some states prohibit discrimination based on sexual orientation, gender identity, source of income, and other factors.</li>
        <li><strong>Enforcement:</strong> States have different agencies and processes for enforcing anti-discrimination laws.</li>
      </ul>
      
      <h2>6. Required Disclosures</h2>
      <p>States have different requirements for what landlords must disclose to tenants:</p>
      <ul>
        <li><strong>Lead-based paint:</strong> Federal law requires disclosure for properties built before 1978, but states may have additional requirements.</li>
        <li><strong>Mold:</strong> Some states require mold disclosures.</li>
        <li><strong>Pest control:</strong> Some states require pest control disclosures.</li>
        <li><strong>Landlord identity:</strong> Some states require landlords to disclose their identity and contact information.</li>
      </ul>
      
      <h2>7. Rent Payment and Late Fees</h2>
      <p>States have different rules about rent payment and late fees:</p>
      <ul>
        <li><strong>Payment methods:</strong> Some states regulate what payment methods landlords must accept.</li>
        <li><strong>Late fees:</strong> States may limit the amount of late fees landlords can charge.</li>
        <li><strong>Grace periods:</strong> Some states require grace periods for rent payment.</li>
      </ul>
      
      <p>Navigating state-specific landlord laws can be complex, but it's essential for ensuring compliance and protecting your investment. Consider consulting with a local real estate attorney to ensure you understand and comply with all applicable laws in your state.</p>
    `,
    date: '2024-01-05',
    author: 'AcciLease AI Team',
    category: 'Legal Guidance'
  }
};

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolved = await params
  const post = blogPosts[resolved.slug as keyof typeof blogPosts];
  
  if (!post) {
    return {
      title: 'Blog Post Not Found - AcciLease AI',
      description: 'The blog post you are looking for does not exist.'
    };
  }
  
  const canonicalUrl = `https://accidental-lease-ai.com/blog/${resolved.slug}`;
  
  return {
    title: `${post.title} - AcciLease AI Blog`,
    description: post.excerpt,
    keywords: [
      post.category.toLowerCase(),
      'landlord tips',
      'lease agreements',
      'landlord tenant laws',
      'rental property management'
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${post.title} - AcciLease AI Blog`,
      description: post.excerpt,
      url: canonicalUrl,
      type: 'article',
      images: [
        {
          url: 'https://accidental-lease-ai.com/og-image.png',
          width: 1200,
          height: 630,
          alt: post.title
        }
      ],
      publishedTime: post.date,
      authors: [post.author],
      section: post.category,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} - AcciLease AI Blog`,
      description: post.excerpt,
      images: ['https://accidental-lease-ai.com/og-image.png']
    }
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<ReactElement> {
  const resolved = await params
  const slug = resolved?.slug ?? ""
  const post = blogPosts[slug as keyof typeof blogPosts];
  
  if (!post) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Blog Post Not Found</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            The blog post you are looking for does not exist.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">{post.date}</span>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
            {post.category}
          </span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-6">{post.title}</h1>
        
        <div className="flex items-center mb-8">
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
            <span className="text-gray-600 dark:text-gray-300 font-medium">{post.author.charAt(0)}</span>
          </div>
          <span className="text-gray-600 dark:text-gray-300">By {post.author}</span>
        </div>
        
        <div className="prose dark:prose-invert max-w-none mb-8">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <Link
            href="/blog"
            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
      
      {/* 结构化数据 - Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            'headline': post.title,
            'description': post.excerpt,
            'author': {
              '@type': 'Person',
              'name': post.author
            },
            'publisher': {
              '@type': 'Organization',
              'name': 'AcciLease AI',
              'logo': {
                '@type': 'ImageObject',
                'url': 'https://accidental-lease-ai.com/favicon.png'
              }
            },
            'datePublished': post.date,
            'dateModified': post.date,
            'articleBody': post.content.replace(/<[^>]*>/g, ''),
            'articleSection': post.category,
            'url': `https://accidental-lease-ai.com/blog/${slug}`
          })
        }}
      />
    </div>
  );
}