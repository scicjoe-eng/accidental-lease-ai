import Link from "next/link"
import { Metadata } from 'next';

// 模拟博客文章数据
const blogPosts = [
  {
    slug: 'how-to-become-a-landlord',
    title: 'How to Become a Landlord: A Step-by-Step Guide for Accidental Landlords',
    excerpt: 'Learn the essential steps to become a successful landlord, from understanding legal requirements to managing your property effectively.',
    date: '2024-01-15',
    author: 'AcciLease AI Team',
    category: 'Landlord Tips'
  },
  {
    slug: 'understanding-lease-agreements',
    title: 'Understanding Lease Agreements: Key Components Every Landlord Should Know',
    excerpt: 'Discover the essential components of a legally compliant lease agreement and how to protect your rights as a landlord.',
    date: '2024-01-10',
    author: 'AcciLease AI Team',
    category: 'Lease Agreements'
  },
  {
    slug: 'state-specific-landlord-laws',
    title: 'State-Specific Landlord Laws: What You Need to Know',
    excerpt: 'Navigate the complex landscape of state-specific landlord-tenant laws to ensure compliance and protect your investment.',
    date: '2024-01-05',
    author: 'AcciLease AI Team',
    category: 'Legal Guidance'
  }
];

export const metadata: Metadata = {
  title: 'Blog - AcciLease AI',
  description: 'Read our latest articles on landlord tips, lease agreements, legal guidance, and more for accidental landlords.',
  keywords: [
    'landlord tips',
    'lease agreements',
    'landlord tenant laws',
    'rental property management',
    'accidental landlord advice'
  ],
  alternates: {
    canonical: 'https://accidental-lease-ai.com/blog',
  },
  openGraph: {
    title: 'Blog - AcciLease AI',
    description: 'Read our latest articles on landlord tips, lease agreements, legal guidance, and more for accidental landlords.',
    url: 'https://accidental-lease-ai.com/blog',
    type: 'website',
    images: [
      {
        url: 'https://accidental-lease-ai.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AcciLease AI Blog'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - AcciLease AI',
    description: 'Read our latest articles on landlord tips, lease agreements, legal guidance, and more for accidental landlords.',
    images: ['https://accidental-lease-ai.com/og-image.png']
  }
};

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">AcciLease AI Blog</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Expert advice and resources for accidental landlords navigating the rental property landscape.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          {blogPosts.map((post) => (
            <div key={post.slug} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <span className="text-sm text-gray-500 dark:text-gray-400 mb-2 md:mb-0">{post.date}</span>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  {post.category}
                </span>
              </div>
              <h2 className="text-2xl font-semibold mb-2">
                <Link href={`/blog/${post.slug}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">By {post.author}</span>
                <a 
                  href={`/blog/${post.slug}`} 
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Read more →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 结构化数据 - Blog */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            'name': 'AcciLease AI Blog',
            'description': 'Expert advice and resources for accidental landlords navigating the rental property landscape.',
            'url': 'https://accidental-lease-ai.com/blog',
            'blogPost': blogPosts.map(post => ({
              '@type': 'BlogPosting',
              'headline': post.title,
              'description': post.excerpt,
              'datePublished': post.date,
              'author': {
                '@type': 'Person',
                'name': post.author
              },
              'url': `https://accidental-lease-ai.com/blog/${post.slug}`
            }))
          })
        }}
      />
    </div>
  );
}