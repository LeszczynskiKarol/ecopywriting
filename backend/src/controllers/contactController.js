// backend/src/controllers/contactController.js
const Contact = require('../models/Contact');
const Meeting = require('../models/Meeting');
const User = require('../models/User');
const { generateEmailTemplate } = require('../utils/emailTemplate');
const sendEmail = require('../utils/sendEmail');

exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const contact = await Contact.create({ name, email, message });

    // Wyślij email do użytkownika
    const userEmailContent = `
      <h2>Dziękujemy za kontakt</h2>
      <p>Otrzymaliśmy Twoją wiadomość i odpowiemy na nią w ciągu 24 godzin.</p>
    `;
    const userEmailData = {
      title: 'eCopywriting.pl - Potwierdzenie otrzymania wiadomości',
      headerTitle: 'eCopywriting.pl',
      content: userEmailContent
    };
    const userEmailHtml = generateEmailTemplate(userEmailData);
    await sendEmail({
      email: email,
      subject: 'eCopywriting.pl - potwierdzenie otrzymania wiadomości',
      message: userEmailHtml,
      isHtml: true
    });

    // Wyślij powiadomienie do administratora
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      const adminEmailContent = `
        <h2>Nowa wiadomość kontaktowa</h2>
        <p>Otrzymano nową wiadomość kontaktową od:</p>
        <ul>
          <li><strong>Imię:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
        </ul>
        <h3>Treść wiadomości:</h3>
        <p>${message}</p>
      `;
      const adminEmailData = {
        title: 'eCopywriting.pl - Nowa wiadomość kontaktowa',
        headerTitle: 'eCopywriting.pl',
        content: adminEmailContent
      };
      const adminEmailHtml = generateEmailTemplate(adminEmailData);
      await sendEmail({
        email: admin.email,
        subject: 'Nowa wiadomość kontaktowa - eCopywriting.pl',
        message: adminEmailHtml,
        isHtml: true
      });
    }

    res.status(201).json({
      success: true,
      data: contact,
      message: 'Wiadomość została wysłana. Odpowiemy w ciągu 24 godzin.'
    });
  } catch (error) {
    console.error('Błąd podczas przetwarzania formularza kontaktowego:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

exports.scheduleMeeting = async (req, res) => {
  try {
    console.log('1. Rozpoczęcie funkcji scheduleMeeting');
    console.log('Otrzymane dane:', req.body);
    const { name, email, phone, date, time } = req.body;

    if (!name || !email || !phone || !date || !time) {
      console.log('2. Brak wymaganych pól');
      return res.status(400).json({
        success: false,
        error: 'Proszę podać wszystkie wymagane pola',
      });
    }

    console.log('3. Tworzenie spotkania w bazie danych');
    const meeting = await Meeting.create({ name, email, phone, date, time });
    console.log('Utworzone spotkanie:', meeting);

    console.log('4. Przygotowanie e-maila do użytkownika');
    const userEmailContent = `
      <h2>Potwierdzenie umówienia spotkania</h2>
      <p>Drogi/Droga ${name},</p>
      <p>Dziękujemy za umówienie spotkania. Potwierdzamy, że skontaktujemy się z Tobą telefonicznie:</p>
      <ul>
        <li><strong>Data:</strong> ${new Date(date).toLocaleDateString()}</li>
        <li><strong>Godzina:</strong> ${time}</li>
        <li><strong>Numer telefonu:</strong> ${phone}</li>
      </ul>
      <p>Jeśli masz jakiekolwiek pytania lub potrzebujesz zmienić termin, prosimy o kontakt.</p>
      <p>Pozdrawiamy,<br>Zespół eCopywriting.pl</p>
    `;
    const userEmailData = {
      title: 'eCopywriting.pl - Potwierdzenie spotkania',
      headerTitle: 'eCopywriting.pl',
      content: userEmailContent
    };
    const userEmailHtml = generateEmailTemplate(userEmailData);

    console.log('5. Wysyłanie e-maila do użytkownika');
    try {
      await sendEmail({
        email: email,
        subject: 'Potwierdzenie umówienia spotkania - eCopywriting.pl',
        message: userEmailHtml,
        isHtml: true
      });
      console.log('E-mail wysłany do użytkownika');
    } catch (emailError) {
      console.error('Błąd podczas wysyłania e-maila do użytkownika:', emailError);
      // Możesz zdecydować, czy chcesz przerwać proces, czy kontynuować mimo błędu
    }


    console.log('6. Przygotowanie e-maila do admina');
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      const adminEmailContent = `
        <h2>Nowe spotkanie umówione</h2>
        <p>Szczegóły spotkania:</p>
        <ul>
          <li><strong>Imię:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Telefon:</strong> ${phone}</li>
          <li><strong>Data:</strong> ${new Date(date).toLocaleDateString()}</li>
          <li><strong>Godzina:</strong> ${time}</li>
        </ul>
      `;
      const adminEmailData = {
        title: 'eCopywriting.pl - Nowe spotkanie',
        headerTitle: 'eCopywriting.pl',
        content: adminEmailContent
      };
      const adminEmailHtml = generateEmailTemplate(adminEmailData);

      console.log('7. Wysyłanie e-maila do admina');
      await sendEmail({
        email: admin.email,
        subject: 'Nowe spotkanie umówione - eCopywriting.pl',
        message: adminEmailHtml,
        isHtml: true
      });
      console.log('E-mail wysłany do admina');
    } else {
      console.log('Nie znaleziono admina');
    }

    console.log('8. Wysyłanie odpowiedzi do klienta');
    res.status(201).json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    console.error('Szczegóły błędu:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};


exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort('-createdAt');
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find().sort('date');
    res.status(200).json({
      success: true,
      count: meetings.length,
      data: meetings,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};