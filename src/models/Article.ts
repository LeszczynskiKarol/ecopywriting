// src/models/Article.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import IUser from './User';

export interface IArticle extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  author: mongoose.Types.ObjectId | typeof IUser;
  featuredImage?: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  isModified(path: string): boolean;
}

// Interfejs dla metod statycznych
interface IArticleModel extends Model<IArticle> {
  findWithAuthor(query?: object): Promise<IArticle[]>;
}

const ArticleSchema = new Schema<IArticle, IArticleModel>(
  {
    title: {
      type: String,
      required: [true, 'Proszę podać tytuł'],
      trim: true,
      maxlength: [100, 'Tytuł nie może być dłuższy niż 100 znaków'],
    },
    slug: {
      type: String,
      unique: true,
    },
    content: {
      type: String,
      required: [true, 'Proszę podać treść artykułu'],
      minlength: [200, 'Treść powinna mieć co najmniej 200 znaków'],
    },
    excerpt: {
      type: String,
      required: [true, 'Proszę podać krótki opis'],
      maxlength: [160, 'Opis nie może być dłuższy niż 160 znaków'],
    },
    category: {
      type: String,
      required: [true, 'Proszę podać kategorię'],
    },
    categorySlug: {
      type: String,
      required: [true, 'Slug kategorii jest wymagany'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    featuredImage: {
      type: String,
    },
    tags: [
      {
        type: String,
      },
    ],
    seoTitle: {
      type: String,
      maxlength: [60, 'SEO tytuł nie może być dłuższy niż 60 znaków'],
    },
    seoDescription: {
      type: String,
      maxlength: [160, 'SEO opis nie może być dłuższy niż 160 znaków'],
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook dla generowania sluga
ArticleSchema.pre<IArticle>('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Helper do pobierania artykułów z populacją autora
ArticleSchema.statics.findWithAuthor = async function (query = {}) {
  return this.find(query).populate('author', 'name email');
};

// Metoda pomocnicza do sprawdzania czy artykuł jest opublikowany
ArticleSchema.methods.isPublished = function (): boolean {
  return this.status === 'published';
};

// Eksport typów dla frontendu
export type ArticleStatus = 'draft' | 'published';

export interface ArticleCreateInput {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  status?: ArticleStatus;
  featuredImage?: string;
}

export interface ArticleUpdateInput extends Partial<ArticleCreateInput> {
  slug?: string;
  categorySlug?: string;
}

// Helper do użycia w API routes
export interface ArticleResponse {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  featuredImage?: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
}

// Eksport modelu
const Article =
  (mongoose.models.Article as IArticleModel) ||
  mongoose.model<IArticle, IArticleModel>('Article', ArticleSchema);

export default Article;
