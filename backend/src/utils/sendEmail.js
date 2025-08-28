// backend/src/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log('Rozpoczęcie wysyłania e-maila');
  console.log(
    'Opcje:',
    JSON.stringify({ ...options, message: 'Content hidden for brevity' })
  );

  // Sprawdź dostępność wszystkich wymaganych zmiennych
  console.log('Checking SMTP configuration:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER, // zamiast SMTP_EMAIL
  });

  // Stwórz transporter z poprawnymi nazwami zmiennych
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false, // false dla portu 587 (TLS)
    auth: {
      user: process.env.SMTP_USER, // zmienione z SMTP_EMAIL
      pass: process.env.SMTP_PASS, // zmienione z SMTP_PASSWORD
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false,
    },
  });

  console.log('Transporter utworzony');

  // Definiuj opcje wiadomości
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.isHtml ? options.message : undefined,
    text: !options.isHtml ? options.message : undefined,
  };

  console.log('Wiadomość przygotowana');

  try {
    // Najpierw zweryfikuj połączenie
    await transporter.verify();
    console.log('Połączenie z serwerem SMTP zweryfikowane');

    // Wyślij email
    console.log('Próba wysłania e-maila');
    const info = await transporter.sendMail(message);
    console.log('E-mail wysłany pomyślnie. Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('Błąd podczas wysyłania e-maila:', error);
    console.error('Szczegóły błędu:', {
      code: error.code,
      command: error.command,
      response: error.response,
    });
    throw error;
  }
};

module.exports = sendEmail;
