// backend/src/utils/sendNewsletterEmails.js

const sendEmail = require('./sendEmail');
const { generateNewsletterEmail } = require('./newsletterTemplate');

const sendNewsletterEmails = async (newsletter, subscribers) => {
  const errors = [];
  const successes = [];

  for (const subscriber of subscribers) {
    try {
      const emailContent = generateNewsletterEmail({
        name: subscriber.name || 'Subskrybencie',
        serviceTitle: newsletter.title,
        serviceDescription: newsletter.summary,
        content: newsletter.content,
        ctaLink: `${process.env.FRONTEND_URL}/uslugi`,
        preferencesLink: `${process.env.FRONTEND_URL}/dashboard/newsletter`,
        unsubscribeLink: `${process.env.FRONTEND_URL}/unsubscribe/${subscriber._id}`
      });

      await sendEmail({
        email: subscriber.email,
        subject: newsletter.title,
        message: emailContent,
        isHtml: true
      });

      successes.push(subscriber.email);
      
      subscriber.lastEmailSent = new Date();
      await subscriber.save();

    } catch (error) {
      console.error(`Błąd wysyłania emaila do ${subscriber.email}:`, error);
      errors.push({ email: subscriber.email, error: error.message });
    }
  }

  return { successes, errors };
};

module.exports = sendNewsletterEmails;