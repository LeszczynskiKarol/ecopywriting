// src/app/blog/[category]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CategoryClient from './CategoryClient'
import { Article } from '@/types/Article'
import BlogLayout from '@/components/layout/BlogLayout'

interface CategoryPageProps {
  params: {
    category: string
  }
}

async function getCategoryArticles(categorySlug: string): Promise<Article[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    const res = await fetch(`${apiUrl}/api/articles/category/${categorySlug}`, {
      next: { revalidate: 3600 },
      headers: {
        'Cache-Control': 'no-cache' // Wymuszamy pobieranie świeżych URL-i
      }
    });

    if (!res.ok) {
      console.error('Failed to fetch category articles:', await res.text());
      throw new Error('Failed to fetch category articles');
    }

    const data = await res.json();
    if (!data.success) {
      throw new Error('Category not found');
    }

    // Artykuły już zawierają podpisane URL-e z backendu
    return data.data;
  } catch (error) {
    console.error('Error in getCategoryArticles:', error);
    throw error;
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${apiUrl}/api/categories/slug/${params.category}`);
    const data = await res.json();

    if (data.success && data.data) {
      return {
        title: data.data.metaTitle || `${params.category} | eCopywriting.pl`,
        description: data.data.metaDescription || `Artykuły w kategorii ${params.category}`,
      }
    }
  } catch (error) {
    console.error('Error fetching category metadata:', error);
  }

  return {
    title: `${params.category} | eCopywriting.pl`,
    description: `Artykuły w kategorii ${params.category}`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  try {
    const articles = await getCategoryArticles(params.category);

    return (
      <BlogLayout title={`Kategoria: ${params.category}`}>
        <CategoryClient articles={articles} category={params.category} />
      </BlogLayout>
    );
  } catch (error) {
    console.error('Error fetching category articles:', error);
    notFound();
  }
} 