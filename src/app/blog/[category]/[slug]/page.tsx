// src/app/blog/[category]/[slug]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleClient from './ArticleClient'
import ArticleLayout from '@/components/layout/ArticleLayout'
import { Article } from '@/types/Article'

interface ArticlePageProps {
  params: {
    category: string
    slug: string
  }
}

async function getArticleData(category: string, slug: string): Promise<Article | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const url = `${apiUrl}/api/articles/${category}/${slug}`
  console.log('Fetching article from:', url)
  console.log('Category:', category)
  console.log('Slug:', slug)

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (res.status === 404) {
      console.log('Article not found')
      return null
    }
    if (!res.ok) {
      console.error('Fetch failed with status:', res.status)
      console.error('Response text:', await res.text())
      throw new Error(`Failed to fetch article. Status: ${res.status}`)
    }
    const data = await res.json()
    if (!data.success) {
      console.error('API returned success: false. Data:', data)
      return null
    }
    console.log('Article data fetched successfully:', data.data)
    return data.data
  } catch (error) {
    console.error('Error fetching article:', error)
    throw error
  }
}

async function getRecentArticles(): Promise<Article[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const res = await fetch(`${apiUrl}/api/articles/recent`, { next: { revalidate: 3600 } })
  if (!res.ok) {
    throw new Error('Failed to fetch recent articles')
  }
  const data = await res.json()
  if (!data.success) {
    throw new Error('Failed to fetch recent articles')
  }
  return data.data
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticleData(params.category, params.slug)
  if (!article) {
    return {
      title: 'Artykuł nie znaleziony | eCopywriting.pl',
      description: 'Przepraszamy, ale nie mogliśmy znaleźć szukanego artykułu.',
    }
  }
  return {
    title: `${article.title} | eCopywriting.pl`,
    description: article.excerpt,
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  try {
    console.log('Fetching article and recent articles')
    console.log('Params:', params)
    const [article, recentArticles] = await Promise.all([
      getArticleData(params.category, params.slug),
      getRecentArticles()
    ])
    console.log('Article and recent articles fetched successfully')
    if (!article) {
      notFound()
    }
    return (
      <ArticleLayout title={article.title} recentArticles={recentArticles}>
        <ArticleClient article={article} />
      </ArticleLayout>
    )
  } catch (error) {
    console.error('Error in ArticlePage:', error)
    throw error // Let Next.js handle other types of errors
  }
}