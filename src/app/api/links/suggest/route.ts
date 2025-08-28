// src/app/api/links/suggest/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Article from '@/models/Article';
import { verifyToken } from '@/utils/auth';

// Funkcja pomocnicza do usuwania znaczników HTML
const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

// Przygotowanie tekstu do analizy
const preprocessText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s{2,}/g, ' ');
};

// Obliczanie podobieństwa tekstu przy użyciu algorytmu Jaccarda
const calculateSimilarity = (
  sourceText: string,
  targetText: string
): number => {
  const sourceWords = new Set(preprocessText(sourceText).split(/\s+/));
  const targetWords = new Set(preprocessText(targetText).split(/\s+/));

  const intersection = new Set(
    [...sourceWords].filter((x) => targetWords.has(x))
  );
  const union = new Set([...sourceWords, ...targetWords]);

  return intersection.size / union.size;
};

// Znajdowanie kontekstu dla linku
const findLinkContext = (sourceText: string, targetTitle: string): string[] => {
  const sentences = sourceText.match(/[^.!?]+[.!?]+/g) || [];
  const lowercaseTitle = targetTitle.toLowerCase();

  return sentences
    .filter((sentence) => sentence.toLowerCase().includes(lowercaseTitle))
    .map((sentence) => sentence.trim());
};

export async function POST(req: NextRequest) {
  try {
    // Sprawdzenie autoryzacji
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
    }

    // Pobranie i walidacja danych
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json(
        { success: false, message: 'Text is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Przygotowanie tekstu
    const cleanText = stripHtml(text);
    const words = preprocessText(cleanText)
      .split(/\s+/)
      .filter((word) => word.length > 4);

    const uniqueWords = [...new Set(words)];

    // Wyszukiwanie artykułów
    const articles = await Article.find({
      status: 'published',
      $or: [
        { title: { $regex: uniqueWords.join('|'), $options: 'i' } },
        { content: { $regex: uniqueWords.join('|'), $options: 'i' } },
        { tags: { $in: uniqueWords } },
      ],
    })
      .select('_id title slug categorySlug content')
      .lean();

    // Generowanie sugestii
    const suggestions = articles
      .map((article) => {
        const articleText = `${article.title} ${stripHtml(article.content)}`;
        const similarity = calculateSimilarity(cleanText, articleText);
        const contexts = findLinkContext(cleanText, article.title);

        return {
          articleId: article._id.toString(),
          title: article.title,
          slug: article.slug,
          categorySlug: article.categorySlug,
          relevance: similarity,
          suggestedContext: contexts,
        };
      })
      .filter((s) => s.relevance > 0.2 && s.suggestedContext.length > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5);

    return NextResponse.json({ success: true, data: suggestions });
  } catch (error) {
    console.error('Link suggestion error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
