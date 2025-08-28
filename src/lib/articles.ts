// src/lib/articles.ts
import dbConnect from './dbConnect';
import Article, {
  ArticleCreateInput,
  ArticleUpdateInput,
  ArticleResponse,
  IArticle,
} from '../models/Article';
import { FilterQuery, Document, Types } from 'mongoose';

// Typ dla autora po populacji
interface PopulatedAuthor {
  _id: Types.ObjectId;
  name: string;
  email: string;
}

// Rozszerzony interfejs dla spopulowanego artykułu
interface PopulatedArticle extends Omit<Document, '_id' | 'author'> {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  author: PopulatedAuthor;
  featuredImage?: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

// Helper do mapowania artykułu na response
function mapArticleToResponse(article: PopulatedArticle): ArticleResponse {
  return {
    _id: article._id.toString(),
    title: article.title,
    slug: article.slug,
    content: article.content,
    excerpt: article.excerpt,
    category: article.category,
    categorySlug: article.categorySlug,
    author: {
      _id: article.author._id.toString(),
      name: article.author.name,
      email: article.author.email,
    },
    featuredImage: article.featuredImage,
    tags: article.tags || [],
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
    status: article.status,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  };
}

export async function getArticles(
  query: FilterQuery<IArticle> = {}
): Promise<ArticleResponse[]> {
  await dbConnect();
  const articles = await Article.find(query)
    .populate<{ author: PopulatedAuthor }>('author', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  return articles.map((article) =>
    mapArticleToResponse(article as unknown as PopulatedArticle)
  );
}

export async function getArticleBySlug(
  categorySlug: string,
  slug: string
): Promise<ArticleResponse | null> {
  await dbConnect();
  const article = await Article.findOne({ categorySlug, slug })
    .populate<{ author: PopulatedAuthor }>('author', 'name email')
    .lean();

  if (!article) return null;

  return mapArticleToResponse(article as unknown as PopulatedArticle);
}

export async function createArticle(
  data: ArticleCreateInput & { author: string }
): Promise<ArticleResponse> {
  await dbConnect();
  const article = await Article.create(data);
  const populatedArticle = await article.populate<{ author: PopulatedAuthor }>(
    'author',
    'name email'
  );

  return mapArticleToResponse(populatedArticle as unknown as PopulatedArticle);
}

export async function updateArticle(
  id: string,
  data: ArticleUpdateInput
): Promise<ArticleResponse | null> {
  await dbConnect();
  const article = await Article.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true }
  )
    .populate<{ author: PopulatedAuthor }>('author', 'name email')
    .lean();

  if (!article) return null;

  return mapArticleToResponse(article as unknown as PopulatedArticle);
}

export async function deleteArticle(id: string): Promise<boolean> {
  await dbConnect();
  const result = await Article.findByIdAndDelete(id);
  return !!result;
}

export async function searchArticles(
  searchTerm: string
): Promise<ArticleResponse[]> {
  await dbConnect();
  const articles = await Article.find({
    $and: [
      { status: 'published' },
      {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { content: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } },
        ],
      },
    ],
  })
    .populate<{ author: PopulatedAuthor }>('author', 'name email')
    .lean();

  return articles.map((article) =>
    mapArticleToResponse(article as unknown as PopulatedArticle)
  );
}

// Helper do wyszukiwania powiązanych artykułów
export async function getRelatedArticles(
  articleId: string,
  category: string,
  limit = 3
): Promise<ArticleResponse[]> {
  await dbConnect();
  const articles = await Article.find({
    _id: { $ne: articleId },
    category,
    status: 'published',
  })
    .populate<{ author: PopulatedAuthor }>('author', 'name email')
    .limit(limit)
    .lean();

  return articles.map((article) =>
    mapArticleToResponse(article as unknown as PopulatedArticle)
  );
}

// Helper do pobierania artykułów po tagach
export async function getArticlesByTags(
  tags: string[]
): Promise<ArticleResponse[]> {
  await dbConnect();
  const articles = await Article.find({
    status: 'published',
    tags: { $in: tags },
  })
    .populate<{ author: PopulatedAuthor }>('author', 'name email')
    .lean();

  return articles.map((article) =>
    mapArticleToResponse(article as unknown as PopulatedArticle)
  );
}

// Helper do wyszukiwania artykułów z paginacją
interface PaginatedArticles {
  articles: ArticleResponse[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export async function getPaginatedArticles(
  query: FilterQuery<IArticle> = {},
  page = 1,
  limit = 10
): Promise<PaginatedArticles> {
  await dbConnect();
  const skip = (page - 1) * limit;

  const [articles, total] = await Promise.all([
    Article.find(query)
      .populate<{ author: PopulatedAuthor }>('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Article.countDocuments(query),
  ]);

  return {
    articles: articles.map((article) =>
      mapArticleToResponse(article as unknown as PopulatedArticle)
    ),
    total,
    page,
    limit,
    hasMore: total > skip + limit,
  };
}
