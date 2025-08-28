// src/app/api/links/suggest/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Article from '@/models/Article';
import { verifyToken } from '@/utils/auth';
import type { Document } from 'mongoose';

// Funkcja pomocnicza do usuwania znaczników HTML
const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

// Definicja typu dla artykułu z bazy danych
interface ArticleDocument extends Document {
  _id: string;
  title: string;
  slug: string;
  categorySlug: string;
  content: string;
  tags: string[];
  status: string;
}

// Definicja typu dla sugestii linków
interface LinkSuggestion {
  articleId: string;
  title: string;
  slug: string;
  categorySlug: string;
  relevance: number;
  suggestedContext: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Metoda niedozwolona',
    });
  }

  try {
    // Sprawdzenie autoryzacji
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Brak tokenu autoryzacji',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Nie masz uprawnień do tej operacji',
      });
    }

    // Połączenie z bazą danych
    await dbConnect();

    const { text } = req.body as { text: string };
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Brak tekstu do analizy',
      });
    }

    // Przygotowanie tekstu do analizy
    const cleanText = stripHtml(text).toLowerCase();
    const words = cleanText
      .split(/\s+/)
      .filter((word) => word.length > 4)
      .map((word) => word.trim());

    // Unikalne słowa do wyszukiwania
    const uniqueWords = [...new Set(words)];

    // Wyszukiwanie pasujących artykułów
    const matchingArticles = (await Article.find({
      status: 'published',
      $or: [
        { title: { $regex: uniqueWords.join('|'), $options: 'i' } },
        { content: { $regex: uniqueWords.join('|'), $options: 'i' } },
        { tags: { $in: uniqueWords } },
      ],
    }).select('_id title slug categorySlug content tags')) as ArticleDocument[];

    // Generowanie sugestii
    const suggestions: LinkSuggestion[] = matchingArticles.map((article) => {
      // Obliczanie trafności
      const articleText =
        `${article.title} ${stripHtml(article.content)}`.toLowerCase();
      const commonWords = uniqueWords.filter((word) =>
        articleText.includes(word)
      );
      const relevance = commonWords.length / uniqueWords.length;

      // Znajdowanie kontekstów
      const contexts = text
        .split(/[.!?]+/)
        .filter((sentence) =>
          sentence.toLowerCase().includes(article.title.toLowerCase())
        )
        .map((sentence) => sentence.trim())
        .filter(Boolean); // Usuwa puste stringi

      return {
        articleId: article._id,
        title: article.title,
        slug: article.slug,
        categorySlug: article.categorySlug,
        relevance,
        suggestedContext: contexts,
      };
    });

    // Filtrowanie i sortowanie sugestii
    const filteredSuggestions = suggestions
      .filter((s) => s.relevance > 0.3 && s.suggestedContext.length > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      data: filteredSuggestions,
    });
  } catch (error) {
    console.error('Error in link suggestion:', error);
    return res.status(500).json({
      success: false,
      message: 'Wystąpił błąd podczas generowania sugestii',
    });
  }
}
