import Link from "next/link"
import { Metadata } from "next"
import type { ReactElement } from "react"

import { BLOG_POSTS_BY_SLUG } from "@/app/blog/posts"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolved = await params
  const post = BLOG_POSTS_BY_SLUG[resolved.slug]
  
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
      ...post.keywords,
      post.category.toLowerCase(),
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
  const post = BLOG_POSTS_BY_SLUG[slug]
  
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
          <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
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
            'articleBody': post.contentHtml.replace(/<[^>]*>/g, ''),
            'articleSection': post.category,
            'url': `https://accidental-lease-ai.com/blog/${slug}`
          })
        }}
      />
    </div>
  );
}