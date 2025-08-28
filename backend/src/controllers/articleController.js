// backend/src/controllers/articleController.js
const mongoose = require('mongoose');
const Article = require('../models/Article');
const { upload } = require('../utils/s3Upload');
const Category = require('../models/Category');
const loadS3Config = require('../config/s3Config');
const s3Config = loadS3Config();

const getArticleWithSignedUrl = async (article) => {
  const articleObj = article.toObject();
  if (articleObj.featuredImage) {
    // Wyciągamy klucz z featuredImage
    const key = s3Config.getKeyFromUrl(articleObj.featuredImage);
    if (key) {
      // Generujemy nowy podpisany URL
      articleObj.featuredImage = await s3Config.getPublicUrl(key);
    }
  }
  return articleObj;
};

exports.createArticle = async (req, res) => {
  console.log('Rozpoczęto tworzenie artykułu');
  upload.single('featuredImage')(req, res, async function (err) {
    console.log('Upload callback rozpoczęty');
    if (err) {
      console.error('Błąd przesyłania:', err);
      return res.status(500).json({
        success: false,
        error: 'Wystąpił błąd podczas przesyłania pliku.',
        details: err.message,
      });
    }

    console.log('Plik przesłany pomyślnie');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);

    try {
      const imageUrl = req.file
        ? await s3Config.getPublicUrl(req.file.key)
        : '/default.jpg';

      console.log('Generated image URL:', imageUrl);

      const articleData = {
        ...req.body,
        author: req.user.id,
        featuredImage: imageUrl,
      };

      // Sprawdź, czy kategoria istnieje
      const category = await Category.findOne({ name: articleData.category });
      if (!category) {
        return res.status(400).json({
          success: false,
          error: `Podana kategoria "${articleData.category}" nie istnieje`,
        });
      }

      // Przypisz slug kategorii do artykułu
      articleData.categorySlug = category.slug;

      console.log('articleData:', articleData);

      if (typeof articleData.tags === 'string') {
        articleData.tags = JSON.parse(articleData.tags);
      }

      const article = await Article.create(articleData);
      console.log('Artykuł utworzony:', article);
      res.status(201).json({
        success: true,
        data: article,
      });
    } catch (error) {
      console.error('Błąd tworzenia artykułu:', error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  });
};

exports.getArticlesByCategory = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const articles = await Article.find({
      categorySlug,
      status: 'published',
    }).populate('author', 'name');

    // Dla każdego artykułu generujemy podpisany URL do zdjęcia
    const articlesWithSignedUrls = await Promise.all(
      articles.map(async (article) => {
        const articleObj = article.toObject();
        if (articleObj.featuredImage) {
          // Wyciągamy klucz z pełnego URL-a
          const key = s3Config.getKeyFromUrl(articleObj.featuredImage);
          if (key) {
            // Generujemy nowy podpisany URL
            articleObj.featuredImage = await s3Config.getPublicUrl(key);
          }
        }
        return articleObj;
      })
    );

    res.status(200).json({
      success: true,
      count: articles.length,
      data: articlesWithSignedUrls,
    });
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getArticles = async (req, res) => {
  try {
    const articles = await Article.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .populate('author', 'name');

    // Generujemy podpisane URL-e dla każdego artykułu
    const articlesWithSignedUrls = await Promise.all(
      articles.map(async (article) => {
        const articleObj = article.toObject();
        if (articleObj.featuredImage) {
          const key = s3Config.getKeyFromUrl(articleObj.featuredImage);
          if (key) {
            articleObj.featuredImage = await s3Config.getPublicUrl(key);
          }
        }
        return articleObj;
      })
    );

    res.status(200).json({
      success: true,
      count: articles.length,
      data: articlesWithSignedUrls,
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getArticle = async (req, res) => {
  try {
    console.log('getArticle called with ID:', req.params.id);
    console.log('User:', req.user);

    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        error: 'No article ID provided',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid article ID format',
      });
    }

    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found',
      });
    }

    res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error('Error in getArticle:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

exports.updateArticle = [
  upload.single('featuredImage'),
  async (req, res) => {
    try {
      console.log('Rozpoczęcie aktualizacji artykułu:', req.params.id);
      console.log('Otrzymane dane z FormData:', req.body);
      console.log('Otrzymany plik:', req.file);
      console.log('Content-Type:', req.headers['content-type']);

      let article = await Article.findById(req.params.id);
      console.log('Znaleziony artykuł:', article);

      if (!article) {
        console.log('Nie znaleziono artykułu');
        return res.status(404).json({
          success: false,
          error: 'Article not found',
        });
      }

      // Parsowanie tagów jeśli przyszły jako string
      if (req.body.tags && typeof req.body.tags === 'string') {
        try {
          req.body.tags = JSON.parse(req.body.tags);
          console.log('Sparsowane tagi:', req.body.tags);
        } catch (error) {
          console.error('Błąd parsowania tagów:', error);
          req.body.tags = req.body.tags.split(',').map((tag) => tag.trim());
        }
      }

      if (article.featuredImage) {
        console.log('Obecne zdjęcie:', article.featuredImage);
      }

      // Obsługa pliku zdjęcia
      if (req.file) {
        console.log('Wykryto nowy plik:', req.file);

        // Jeśli istnieje stare zdjęcie, usuń je
        if (article.featuredImage) {
          const oldImageKey = s3Config.getKeyFromUrl(article.featuredImage);
          console.log('Klucz starego zdjęcia:', oldImageKey);

          if (oldImageKey) {
            try {
              console.log('Próba usunięcia starego zdjęcia');
              await s3Config.deleteFile(oldImageKey);
              console.log('Stare zdjęcie usunięte pomyślnie');
            } catch (error) {
              console.error('Błąd podczas usuwania starego zdjęcia:', error);
            }
          }
        }

        // Generowanie URL dla nowego zdjęcia
        try {
          console.log('Generowanie URL dla nowego zdjęcia');
          const imageUrl = await s3Config.getPublicUrl(req.file.key);
          console.log('Nowy URL zdjęcia:', imageUrl);
          req.body.featuredImage = imageUrl;
        } catch (error) {
          console.error(
            'Błąd podczas generowania URL dla nowego zdjęcia:',
            error
          );
        }
      }

      console.log('Dane do aktualizacji:', req.body);

      // Usuwanie pustych pól z req.body
      Object.keys(req.body).forEach((key) => {
        if (
          req.body[key] === '' ||
          req.body[key] === undefined ||
          req.body[key] === null
        ) {
          delete req.body[key];
        }
      });

      const updatedArticle = await Article.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      console.log('Zaktualizowany artykuł:', updatedArticle);

      res.status(200).json({
        success: true,
        data: updatedArticle,
      });
    } catch (error) {
      console.error('Błąd podczas aktualizacji:', error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
];

exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found',
      });
    }

    if (
      article.author.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this article',
      });
    }

    // Używamy findByIdAndDelete zamiast remove()
    await Article.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getArticleBySlug = async (req, res) => {
  try {
    const { categorySlug, slug } = req.params;
    const article = await Article.findOne({ categorySlug, slug });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Artykuł nie znaleziony',
      });
    }

    // Generujemy podpisany URL dla artykułu
    const articleWithSignedUrl = await getArticleWithSignedUrl(article);

    res.status(200).json({
      success: true,
      data: articleWithSignedUrl,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getRecentArticles = async (req, res) => {
  try {
    const articles = await Article.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('author', 'name');

    // Generujemy podpisane URL-e dla każdego artykułu
    const articlesWithSignedUrls = await Promise.all(
      articles.map((article) => getArticleWithSignedUrl(article))
    );

    res.status(200).json({
      success: true,
      data: articlesWithSignedUrls,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getArticlesByCategorySlug = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const articles = await Article.find({
      categorySlug,
      status: 'published',
    }).populate('author', 'name');

    // Generujemy podpisane URL-e dla każdego artykułu
    const articlesWithSignedUrls = await Promise.all(
      articles.map((article) => getArticleWithSignedUrl(article))
    );

    res.status(200).json({
      success: true,
      count: articles.length,
      data: articlesWithSignedUrls,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
