// backend/src/controllers/userController.js
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Subscriber = require('../models/Subscriber');
const { generateEmailTemplate } = require('../utils/emailTemplate');
const Payment = require('../models/Payment');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const generateVerificationCode = require('../utils/generateVerificationCode');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.verifyAccount = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findOne({ verificationCode: code });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Nieprawidłowy kod weryfikacyjny' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Konto zostało pomyślnie zweryfikowane',
      token,
    });
  } catch (error) {
    console.error('Error in verifyAccount:', error);
    res.status(500).json({
      success: false,
      message: 'Wystąpił błąd podczas weryfikacji konta',
    });
  }
};

exports.login = async (req, res) => {
  const { email, password, recaptchaToken } = req.body;

  try {
    // Weryfikacja reCAPTCHA w środowisku produkcyjnym
    if (process.env.NODE_ENV === 'production') {
      const recaptchaResponse = await verifyRecaptcha(
        recaptchaToken,
        req.headers.host
      );
      console.log(
        '2. Odpowiedź reCAPTCHA:',
        JSON.stringify(recaptchaResponse, null, 2)
      );

      if (!recaptchaResponse.success) {
        return res.status(400).json({
          success: false,
          message: 'Weryfikacja reCAPTCHA nie powiodła się',
        });
      }
    } else {
      console.log(
        '2. Pomijanie weryfikacji reCAPTCHA w środowisku:',
        process.env.NODE_ENV
      );
    }

    // Wyszukiwanie użytkownika
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Nieprawidłowe dane logowania',
      });
    }

    // DODAJEMY SPRAWDZENIE WERYFIKACJI
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          'Konto nie zostało zweryfikowane. Sprawdź swoją skrzynkę email i potwierdź rejestrację.',
      });
    }

    // Weryfikacja hasła
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Nieprawidłowe dane logowania',
      });
    }

    // Generowanie tokenu JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Przygotowanie danych użytkownika
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      accountBalance: user.accountBalance || 0,
      notificationPermissions: user.notificationPermissions || {},
      newsletterPreferences: user.newsletterPreferences || {},
      companyDetails: user.companyDetails || null,
    };

    console.log('3. Logowanie zakończone sukcesem');
    res.status(200).json({
      success: true,
      token,
      user: userData,
    });
  } catch (error) {
    console.error('=== BŁĄD PODCZAS LOGOWANIA ===', error);
    res.status(500).json({
      success: false,
      message: 'Wystąpił błąd serwera podczas logowania',
      error: error.message,
    });
  }
};

async function verifyRecaptcha(token, requestHost = 'unknown') {
  if (!token) {
    return {
      success: false,
      'error-codes': ['missing-token'],
    };
  }

  try {
    const params = new URLSearchParams();
    params.append('secret', process.env.RECAPTCHA_SECRET_KEY);
    params.append('response', token);

    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      }
    );

    const data = await response.json();
    console.log('2. Odpowiedź z Google:', JSON.stringify(data, null, 2));

    // W środowisku produkcyjnym ignorujemy browser-error
    if (
      process.env.NODE_ENV === 'production' &&
      !data.success &&
      data['error-codes']?.includes('browser-error')
    ) {
      console.log('3. Ignorowanie browser-error w produkcji');
      return {
        success: true,
        score: 0.9,
        action: 'login',
        hostname: requestHost,
      };
    }

    return data;
  } catch (error) {
    console.error('4. Błąd weryfikacji:', error);

    // W produkcji zwracamy sukces w przypadku błędu
    if (process.env.NODE_ENV === 'production') {
      return {
        success: true,
        score: 0.9,
        action: 'login',
        hostname: requestHost,
      };
    }

    return {
      success: false,
      'error-codes': ['verification-failed'],
    };
  }
}

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Order.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
        },
      },
    ]);

    const result =
      stats.length > 0 ? stats[0] : { totalOrders: 0, totalSpent: 0 };

    res.status(200).json({
      success: true,
      data: {
        totalOrders: result.totalOrders,
        totalSpent: result.totalSpent,
      },
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Nie udało się pobrać statystyk użytkownika',
      error: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    console.log('Received update request:', req.body);
    const { name, companyDetails } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name, companyDetails } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      console.log('User not found');
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    console.log('User after update:', updatedUser);

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        companyDetails: updatedUser.companyDetails,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          'Nowe hasło musi mieć co najmniej 8 znaków, zawierać dużą literę, cyfrę i znak specjalny',
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message:
          'Obecne hasło jest błędne. Wprowadź prawidłowe obecne hasło, którym się logujesz.',
      });
    }

    user.password = newPassword;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: 'Hasło zostało zmienione pomyślnie' });
  } catch (error) {
    console.error('Error changing password:', error);
    res
      .status(500)
      .json({ success: false, message: 'Wystąpił błąd podczas zmiany hasła' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Nie znaleziono użytkownika z tym adresem email',
      });
    }

    // Generuj token resetowania hasła
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Ustaw token resetowania hasła i datę wygaśnięcia
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // Token ważny przez 10 minut

    await user.save();

    // Wyślij email z linkiem do resetowania hasła
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const emailContent = `
      <h2>Reset hasła</h2>
      <p>Otrzymujesz ten email, ponieważ otrzymaliśmy prośbę o zresetowanie hasła dla Twojego adresu e-mail.</p>
      <p>Kliknij w poniższy przycisk, aby zresetować hasło:</p>
      <p>
        <a href="${resetUrl}" class="button">Zresetuj hasło</a>
      </p>
      <p>Zignoruj tę wiadomość, jeśli nie chcesz zmieniać hasła.</p>
      <p>Link do resetowania hasła wygaśnie za 10 minut.</p>
    `;

    const emailData = {
      title: 'Reset hasła - eCopywriting.pl',
      headerTitle: 'Reset hasła',
      content: emailContent,
    };

    const emailHtml = generateEmailTemplate(emailData);

    try {
      await sendEmail({
        email: user.email,
        subject: 'Reset hasła - eCopywriting.pl',
        message: emailHtml,
        isHtml: true,
      });

      res.status(200).json({
        success: true,
        message: 'Email z instrukcjami resetowania hasła został wysłany',
      });
    } catch (error) {
      console.error('Error sending email:', error);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: 'Nie udało się wysłać emaila. Spróbuj ponownie później.',
      });
    }
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Wystąpił błąd serwera',
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Znajdź użytkownika z danym tokenem resetowania hasła
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid or expired token' });
    }

    // Ustaw nowe hasło
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res
      .status(200)
      .json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateNotificationPermissions = async (req, res) => {
  try {
    console.log('Updating notification permissions:', req.body);
    const { browser, sound } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          'notificationPermissions.browser': browser,
          'notificationPermissions.sound': sound,
        },
      },
      { new: true }
    );
    if (!user) {
      console.log('User not found');
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    console.log('Updated user permissions:', user.notificationPermissions);
    res.json({ success: true, data: user.notificationPermissions });
  } catch (error) {
    console.error('Error updating notification permissions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.refreshSession = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Sprawdź, czy token jest nadal ważny
    const currentTime = Math.floor(Date.now() / 1000);
    if (req.user.exp > currentTime) {
      // Token jest nadal ważny, zwróć istniejący token
      return res.status(200).json({
        success: true,
        token: req.headers.authorization.split(' ')[1],
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyDetails: user.companyDetails,
          notificationPermissions: user.notificationPermissions,
        },
      });
    }

    // Token wygasł, wygeneruj nowy
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyDetails: user.companyDetails,
        notificationPermissions: user.notificationPermissions,
      },
    });
  } catch (error) {
    console.error('Error in refreshSession:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

exports.topUpAccount = async (req, res) => {
  try {
    const userId = req.user.id; // Pobierz ID użytkownika z obiektu req.user
    const { originalAmount, discountedAmount, appliedDiscount } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'Użytkownik nie znaleziony' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['blik', 'card', 'paypal'],
      line_items: [
        {
          price_data: {
            currency: 'pln',
            product_data: {
              name: 'Doładowanie konta',
              description: `Doładowanie ${originalAmount.toFixed(2)} zł z rabatem ${appliedDiscount}%`,
            },
            unit_amount: Math.round(discountedAmount * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?top_up_canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user._id.toString(),
        type: 'account_top_up',
        originalAmount: originalAmount.toString(),
        discountedAmount: discountedAmount.toString(),
        appliedDiscount: appliedDiscount.toString(),
        userToken: req.headers.authorization.split(' ')[1],
      },
    });

    res.status(200).json({
      success: true,
      paymentUrl: session.url,
    });
  } catch (error) {
    console.error('Błąd podczas tworzenia sesji doładowania:', error);
    res.status(500).json({
      success: false,
      message: 'Wystąpił błąd podczas przetwarzania doładowania',
      error: error.message,
    });
  }
};

exports.getLatestTopUp = async (req, res) => {
  try {
    const latestTopUp = await Payment.findOne({
      user: req.user.id,
      type: 'top_up',
    }).sort('-createdAt');
    if (!latestTopUp) {
      return res
        .status(404)
        .json({ success: false, message: 'Nie znaleziono żadnych doładowań' });
    }

    res.json({
      success: true,
      amount: latestTopUp.amount,
      paidAmount: latestTopUp.paidAmount,
      appliedDiscount: latestTopUp.appliedDiscount,
      remainingBalance: req.user.accountBalance,
      stripeSessionId: latestTopUp.stripeSessionId,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Błąd serwera', error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Wylogowano pomyślnie' });
  } catch (error) {
    console.error('Błąd podczas wylogowywania:', error);
    res
      .status(500)
      .json({ success: false, message: 'Wystąpił błąd podczas wylogowywania' });
  }
};

exports.getRegistrationStatus = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Nie znaleziono użytkownika o podanym adresie email',
      });
    }

    return res.status(200).json({
      success: true,
      isVerified: user.isVerified,
      needsVerification: !user.isVerified,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Wystąpił błąd podczas sprawdzania statusu rejestracji',
    });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, companyDetails } = req.body;

    // Sprawdź, czy użytkownik już istnieje
    let user = await User.findOne({ email });

    if (user) {
      // Jeśli użytkownik istnieje, ale nie jest zweryfikowany
      if (!user.isVerified) {
        // Generuj nowy kod weryfikacyjny
        const verificationCode = generateVerificationCode();

        // Aktualizuj dane użytkownika
        user.verificationCode = verificationCode;
        if (name) user.name = name;
        if (password) user.password = password;
        if (companyDetails) user.companyDetails = companyDetails;

        await user.save();

        // Wyślij nowy email weryfikacyjny
        const emailContent = `
          <h2>Weryfikacja konta</h2>
          <p>Twój nowy kod weryfikacyjny to: <strong>${verificationCode}</strong></p>
        `;

        const emailData = {
          title: 'eCopywriting.pl - Ponowna weryfikacja',
          headerTitle: 'eCopywriting.pl',
          content: emailContent,
        };

        const emailHtml = generateEmailTemplate(emailData);

        await sendEmail({
          email: user.email,
          subject: 'eCopywriting.pl - ponowna weryfikacja konta',
          message: emailHtml,
          isHtml: true,
        });

        return res.status(200).json({
          success: true,
          message: 'Wysłano nowy kod weryfikacyjny na podany adres email',
          token: user.getSignedJwtToken(),
        });
      } else {
        return res.status(400).json({
          success: false,
          message:
            'Użytkownik o tym adresie email już istnieje i jest zweryfikowany',
        });
      }
    }
    try {
      console.log('Rozpoczęcie procesu rejestracji');
      const { name, email, password, companyDetails } = req.body;
      console.log('Dane otrzymane:', { name, email, companyDetails });

      // Sprawdź, czy użytkownik o podanym emailu już istnieje
      let user = await User.findOne({ email });
      if (user) {
        console.log('Użytkownik już istnieje');
        return res.status(400).json({
          success: false,
          message: 'Użytkownik o tym adresie email już istnieje',
        });
      }

      // Generuj kod weryfikacyjny
      const verificationCode = generateVerificationCode();
      console.log('Wygenerowany kod weryfikacyjny:', verificationCode);

      // Tworzenie nowego użytkownika
      user = new User({
        name,
        email,
        password,
        role: 'client',
        companyDetails,
        verificationCode,
        isVerified: false,
      });

      console.log('Próba zapisania użytkownika');
      await user.save();
      console.log('Użytkownik zapisany pomyślnie');

      // Dodaj użytkownika do listy subskrybentów
      console.log('Próba dodania użytkownika do listy subskrybentów');
      const subscriber = new Subscriber({
        email: user.email,
        name: user.name,
        user: user._id,
        preferences: {
          categories: [
            'Nowości',
            'Promocje',
            'Porady',
            'Branżowe',
            'Technologia',
          ],
        },
        isActive: true,
      });

      try {
        await subscriber.save();
        console.log('Subskrybent dodany pomyślnie');
      } catch (subError) {
        console.error('Błąd podczas dodawania subskrybenta:', subError);
      }

      // Wyślij email z kodem weryfikacyjnym
      console.log('Próba wysłania emaila weryfikacyjnego');
      const emailContent = `
        <h2>Weryfikacja konta</h2>
        <p>Twój kod weryfikacyjny to: <strong>${verificationCode}</strong></p>
      `;

      const emailData = {
        title: 'eCopywriting.pl',
        headerTitle: 'eCopywriting.pl',
        content: emailContent,
      };

      const emailHtml = generateEmailTemplate(emailData);

      await sendEmail({
        email: user.email,
        subject: 'eCopywriting.pl - weryfikacja konta',
        message: emailHtml,
        isHtml: true,
      });

      // Stwórz token JWT
      const token = user.getSignedJwtToken();
      console.log('Token JWT wygenerowany');

      res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        message:
          'Konto zostało utworzone. Sprawdź swoją skrzynkę email, aby zweryfikować konto.',
      });
      console.log('Odpowiedź wysłana do klienta');
    } catch (error) {
      console.error('Błąd podczas rejestracji:', error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    console.error('Błąd podczas rejestracji:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
