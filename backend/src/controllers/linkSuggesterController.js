// backend/src/controllers/linkSuggesterController.js
const asyncHandler = require('../middlewares/async');
const linkSuggester = require('../services/linkSuggester');
const ErrorResponse = require('../utils/errorResponse');

exports.generateSuggestions = asyncHandler(async (req, res, next) => {
  const { text, articleId } = req.body;

  if (!text) {
    return next(new ErrorResponse('Proszę podać tekst do analizy', 400));
  }

  try {
    const suggestions = await linkSuggester.generateLinkSuggestions(
      text,
      articleId
    );

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return next(new ErrorResponse('Błąd podczas generowania sugestii', 500));
  }
});

exports.insertLinks = asyncHandler(async (req, res, next) => {
  const { text, suggestions } = req.body;

  if (!text || !suggestions) {
    return next(new ErrorResponse('Proszę podać tekst i sugestie linków', 400));
  }

  try {
    let modifiedText = text;

    // Sortujemy sugestie według długości tytułu (od najdłuższego do najkrótszego)
    // aby uniknąć konfliktów przy zastępowaniu
    suggestions
      .sort((a, b) => b.title.length - a.title.length)
      .forEach((suggestion) => {
        const escapeRegExp = (string) => {
          return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };

        const title = escapeRegExp(suggestion.title);
        suggestion.suggestedContext.forEach((context) => {
          const regex = new RegExp(`(${title})`, 'gi');
          modifiedText = modifiedText.replace(
            regex,
            `<a href="/articles/${suggestion.categorySlug}/${suggestion.slug}">$1</a>`
          );
        });
      });

    res.status(200).json({
      success: true,
      data: {
        text: modifiedText,
      },
    });
  } catch (error) {
    console.error('Error inserting links:', error);
    return next(new ErrorResponse('Błąd podczas wstawiania linków', 500));
  }
});

// Dodano obsługę błędów dla linków
exports.handleLinkError = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error(err);

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};
