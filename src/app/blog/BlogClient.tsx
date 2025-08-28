// src/app/blog/BlogClient.tsx
'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Article } from '@/types/Article'

const ARTICLES_PER_PAGE = 12

interface BlogClientProps {
  initialArticles: Article[]
  initialCategories: { name: string; slug: string }[]
}

export default function BlogClient({ initialArticles, initialCategories }: BlogClientProps) {
  const [visibleArticles, setVisibleArticles] = useState<number>(ARTICLES_PER_PAGE)
  const [activeCategory, setActiveCategory] = useState<string>('Wszystkie')

  const loadMoreArticles = () => {
    setVisibleArticles(prevVisible => prevVisible + ARTICLES_PER_PAGE)
  }

  const filteredArticles = initialArticles
    .filter(article => activeCategory === 'Wszystkie' || article.categorySlug === activeCategory)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, visibleArticles)

  return (
    <div className="space-y-8">
      <p className="text-xl text-center mb-12 text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
        Najnowsze trendy, porady i inspiracje ze świata copywritingu i content marketingu.
      </p>
      <Tabs defaultValue="Wszystkie" className="w-full" onValueChange={(value) => setActiveCategory(value)}>
        <TabsList className="flex justify-center mb-8">
          <TabsTrigger value="Wszystkie">Wszystkie</TabsTrigger>
          {initialCategories.map((category) => (
            <TabsTrigger key={category.slug} value={category.slug}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <motion.div
                key={article._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-l-4 border-[#38c775]"
                whileHover={{ scale: 1.03, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              >
                <Link href={`/blog/${article.categorySlug}/${article.slug}`}>
                  <img src={article.featuredImage} alt={article.title} className="w-full h-48 object-cover" />
                </Link>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">
                    <Link
                      href={`/blog/${article.categorySlug}/${article.slug}`}
                      className="text-gray-900 dark:text-gray-100 hover:text-[#38c775] dark:hover:text-[#38c775] transition duration-300"
                    >
                      {article.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{article.excerpt}</p>
                  <Link
                    href={`/blog/${article.categorySlug}/${article.slug}`}
                    className="text-gray-700 hover:text-[#38c775] dark:text-gray-300 dark:hover:text-[#38c775] transition-colors duration-300"
                  >
                    Czytaj więcej →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          {filteredArticles.length < initialArticles.filter(article =>
            activeCategory === 'Wszystkie' || article.categorySlug === activeCategory
          ).length && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMoreArticles}
                  className="bg-[#38c775] hover:bg-[#2ea55f] text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                >
                  Załaduj więcej
                </button>
              </div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  )
}