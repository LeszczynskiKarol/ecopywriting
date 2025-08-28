// src/types/Article.ts
export interface Article {
    _id: string;
    title: string;
    content: string;
    excerpt: string;
    category: string;
    categorySlug: string;
    author: {
      _id: string;
      name: string;
    };
    featuredImage: string;
    tags: string[];
    seoTitle: string;
    seoDescription: string;
    status: 'draft' | 'published';
    slug: string;
    createdAt: string;
    updatedAt: string;
  }