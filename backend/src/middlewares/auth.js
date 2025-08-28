// backend/src/middlewares/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.auth_token) {
    token = req.cookies.auth_token;
    res.clearCookie('auth_token');
  } else {
    console.log('Brak tokenu');
  }

  if (!token || token === 'null') {
    console.log('Token nieprawidłowy lub brak tokenu');
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      console.log('6. Użytkownik nie znaleziony');
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }

    next();
  } catch (error) {
    console.error('=== BŁĄD AUTORYZACJI ===');
    console.error('Szczegóły:', error);
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route',
    });
  }
};

exports.checkVerification = async (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message:
        'Konto nie zostało zweryfikowane. Sprawdź swoją skrzynkę email i zweryfikuj konto.',
    });
  }
  next();
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Brak uprawnień',
      });
    }
    next();
  };
};
