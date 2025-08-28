// backend/src/services/linkSuggester.js
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const Article = require('../models/Article');

class LinkSuggester {
  constructor() {
    this.MIN_RELEVANCE_SCORE = 0.3;
    this.tokenizer = tokenizer;
    this.TfIdf = natural.TfIdf;
  }

  // Przygotowanie tekstu do analizy
  preprocessText(text) {
    return text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .replace(/\s{2,}/g, ' ');
  }

  // Ekstrakcja kluczowych fraz z tekstu
  async extractKeyPhrases(text) {
    const tfidf = new this.TfIdf();
    const processedText = this.preprocessText(text);
    const tokens = this.tokenizer.tokenize(processedText);

    // Dodajemy tokeny do TF-IDF
    tfidf.addDocument(tokens);

    // Znajdujemy najważniejsze frazy
    const keyPhrases = [];
    tfidf.listTerms(0).forEach((item) => {
      if (item.tfidf > 3.0) {
        // Próg istotności
        keyPhrases.push(item.term);
      }
    });

    return keyPhrases;
  }

  // Znajdowanie pasujących artykułów
  async findMatchingArticles(keyPhrases) {
    const matchingArticles = await Article.find({
      status: 'published',
      $or: [
        { title: { $regex: keyPhrases.join('|'), $options: 'i' } },
        { content: { $regex: keyPhrases.join('|'), $options: 'i' } },
        { tags: { $in: keyPhrases } },
      ],
    }).select('title slug categorySlug content');

    return matchingArticles;
  }

  // Obliczanie trafności dopasowania
  calculateRelevance(sourceText, targetArticle) {
    const sourceTokens = new Set(
      this.tokenizer.tokenize(this.preprocessText(sourceText))
    );
    const targetTokens = new Set(
      this.tokenizer.tokenize(
        this.preprocessText(targetArticle.title + ' ' + targetArticle.content)
      )
    );

    const intersection = new Set(
      [...sourceTokens].filter((x) => targetTokens.has(x))
    );
    return intersection.size / Math.min(sourceTokens.size, targetTokens.size);
  }

  // Generowanie sugestii linków
  async generateLinkSuggestions(text, currentArticleId = null) {
    const keyPhrases = await this.extractKeyPhrases(text);
    const matchingArticles = await this.findMatchingArticles(keyPhrases);

    const suggestions = matchingArticles
      .filter((article) => article._id.toString() !== currentArticleId)
      .map((article) => {
        const relevance = this.calculateRelevance(text, article);
        return {
          articleId: article._id,
          title: article.title,
          slug: article.slug,
          categorySlug: article.categorySlug,
          relevance,
          suggestedContext: this.findLinkContext(text, article.title),
        };
      })
      .filter((suggestion) => suggestion.relevance >= this.MIN_RELEVANCE_SCORE)
      .sort((a, b) => b.relevance - a.relevance);

    return suggestions;
  }

  // Znajdowanie kontekstu dla linku
  findLinkContext(sourceText, targetTitle) {
    const sentences = sourceText.match(/[^.!?]+[.!?]+/g) || [];
    const contexts = [];

    sentences.forEach((sentence) => {
      if (
        this.preprocessText(sentence).includes(this.preprocessText(targetTitle))
      ) {
        contexts.push(sentence.trim());
      }
    });

    return contexts;
  }
}

module.exports = new LinkSuggester();
