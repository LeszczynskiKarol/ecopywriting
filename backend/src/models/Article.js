// backend/src/models/Article.js
const mongoose = require('mongoose');
const slugify = require('slugify');

const ArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Proszę podać tytuł'],
      trim: true,
      maxlength: [100, 'Tytuł nie może być dłuższy niż 100 znaków'],
    },
    slug: String,
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
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    featuredImage: {
      type: String,
    },
    tags: [String],
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

ArticleSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

module.exports = mongoose.model('Article', ArticleSchema);
