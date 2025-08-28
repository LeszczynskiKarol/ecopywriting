// src/lib/api.ts
import { Article } from '../types/Article';

export async function getBlogArticles() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/articles`
  );
  const data = await response.json();
  if (data.success) {
    return data.data.sort(
      (a: Article, b: Article) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  return [];
}

export async function getCategories() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/categories`
  );
  const data = await response.json();
  if (data.success) {
    return ['Wszystkie', ...data.data.map((category: any) => category.name)];
  }
  return ['Wszystkie'];
}

export async function getArticle(id: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/admin/articles/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (data.success) {
    return data.data;
  }
  throw new Error(data.error || 'Nie udało się pobrać artykułu');
}

export async function updateArticle(id: string, articleData: FormData) {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/admin/articles/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: articleData,
  });

  const data = await response.json();
  if (data.success) {
    return data.data;
  }
  throw new Error(data.error || 'Nie udało się zaktualizować artykułu');
}
