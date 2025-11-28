// src/app/blog/[category]/[slug]/ArticleClient.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Article } from '@/types/Article'
import { formatDate } from '@/utils/dateFormatter'

interface ArticleClientProps {
  article: Article
}

export default function ArticleClient({ article }: ArticleClientProps) {
  return (
    <motion.article
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      initial={false}  // ← NIE animuj przy pierwszym renderowaniu (zachowaj stan z SSR)
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative w-full h-64">
        <Image
          src={article.featuredImage}
          alt={article.title}
          fill
          className="object-cover"
          priority  // ← ładuj obrazek od razu, nie lazy
          sizes="(max-width: 768px) 100vw, 75vw"
        />
      </div>
      <div className="p-6">
        <Link href={`/blog/${article.categorySlug}`}>
          <span className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm mb-2 block">
            {article.category}
          </span>
        </Link>

        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">{article.title}</h1>
        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-4">
          <span>Autor: Karol Leszczyński</span>
          <span className="mx-2">•</span>
          <time dateTime={article.createdAt}>{formatDate(article.createdAt)}</time>
        </div>
        <div
          className="prose dark:prose-invert max-w-none article-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap">
            {article.tags.map((tag) => (
              <span key={tag} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium mr-2 mb-2 px-2.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  )
}