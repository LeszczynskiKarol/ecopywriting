// backend/src/controllers/newsletterController.js
const Newsletter = require('../models/Newsletter');
const { generateEmailTemplate } = require('../utils/emailTemplate');
const Subscriber = require('../models/Subscriber');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const sendNewsletterEmails = require('../utils/sendNewsletterEmails');

exports.createNewsletter = async (req, res) => {
  try {
    const newsletter = await Newsletter.create(req.body);
    res.status(201).json({ success: true, data: newsletter });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};



  

exports.getNewsletters = async (req, res) => {
  try {
    const newsletters = await Newsletter.find().sort({ createdAt: -1 });
    console.log('Fetched newsletters:', newsletters);
    res.status(200).json({ success: true, count: newsletters.length, data: newsletters || [] });
  } catch (error) {
    console.error('Error fetching newsletters:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
  

exports.sendNewsletter = async (req, res) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);
    if (!newsletter) {
      return res.status(404).json({ success: false, error: 'Newsletter nie znaleziony' });
    }
    console.log('Sending newsletter:', newsletter);

    const subscribers = await Subscriber.find({
      'preferences.categories': newsletter.category,
      isActive: true
    });

    console.log('Matching subscribers:', subscribers);

    const { successes, errors } = await sendNewsletterEmails(newsletter, subscribers);

    console.log('Sending results - Successes:', successes, 'Errors:', errors);

    newsletter.recipients = subscribers.map(sub => sub._id);
    newsletter.sentDate = new Date();
    await newsletter.save();

    for (const subscriber of subscribers) {
      await Subscriber.findByIdAndUpdate(
        subscriber._id,
        { $push: { newsletterHistory: newsletter._id } },
        { new: true }
      );
    }

    res.status(200).json({ success: true, data: newsletter });
  } catch (error) {
    console.error('Error in sendNewsletter:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getNewsletterHistory = async (req, res) => {
  try {
    const subscriber = await Subscriber.findOne({ user: req.user.id }).populate('newsletterHistory');
    if (!subscriber) {
      return res.status(404).json({ success: false, error: 'Subskrybent nie znaleziony' });
    }
    const newsletters = subscriber.newsletterHistory;
    res.status(200).json({ success: true, data: newsletters });
  } catch (error) {
    console.error('Error in getNewsletterHistory:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.getSubscriptionStatus = async (req, res) => {
  try {
    const { email } = req.query;
    const subscriber = await Subscriber.findOne({ email });
    
    if (!subscriber) {
      return res.status(200).json({ isSubscribed: false });
    }

    res.status(200).json({
      isSubscribed: subscriber.isActive,
      preferences: subscriber.preferences
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.manageSubscription = async (req, res) => {
  try {
    const { email, isSubscribed, preferences } = req.body;

    let subscriber = await Subscriber.findOne({ email });

    if (!subscriber && isSubscribed) {
      subscriber = new Subscriber({ email, isActive: true, preferences });
    } else if (subscriber) {
      subscriber.isActive = isSubscribed;
      subscriber.preferences = preferences;
    } else {
      return res.status(404).json({ success: false, message: 'Subscriber not found' });
    }

    await subscriber.save();

    res.status(200).json({ success: true, message: 'Subscription updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.manageSubscription = async (req, res) => {
  try {
    const { email, isSubscribed, preferences } = req.body;

    let subscriber = await Subscriber.findOne({ email });

    if (!subscriber && isSubscribed) {
      // Generuj token potwierdzający
      const confirmToken = crypto.randomBytes(20).toString('hex');
      
      subscriber = new Subscriber({ 
        email, 
        isActive: false, 
        preferences,
        confirmToken,
        confirmTokenExpire: Date.now() + 24 * 60 * 60 * 1000 // Token ważny 24 godziny
      });
      
      await subscriber.save();

      // Wyślij email z linkiem potwierdzającym
      const confirmUrl = `${process.env.FRONTEND_URL}/confirm-subscription/${confirmToken}`;
const emailContent = `
  <h2>Potwierdź subskrypcję newslettera</h2>
  <p>Kliknij w poniższy link, aby potwierdzić subskrypcję:</p>
  <p><a href="${confirmUrl}" class="button">Potwierdź subskrypcję</a></p>
`;

const emailData = {
  title: 'eCopywriting.pl',
  headerTitle: 'eCopywriting.pl',
  content: emailContent
};

const emailHtml = generateEmailTemplate(emailData);

await sendEmail({
  email: subscriber.email,
  subject: 'eCopywriting.pl - Potwierdź subskrypcję newslettera',
  message: emailHtml,
  isHtml: true
});



      return res.status(200).json({ success: true, message: 'Wysłano link potwierdzający. Sprawdź swoją skrzynkę email.' });
    } else if (subscriber) {
      subscriber.isActive = isSubscribed;
      subscriber.preferences = preferences;
      await subscriber.save();
    } else {
      return res.status(404).json({ success: false, message: 'Subscriber not found' });
    }

    res.status(200).json({ success: true, message: 'Subscription updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.confirmSubscription = async (req, res) => {
  try {
    const { token } = req.params;
    const subscriber = await Subscriber.findOne({
      confirmToken: token,
      confirmTokenExpire: { $gt: Date.now() }
    });

    if (!subscriber) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    subscriber.isActive = true;
    subscriber.confirmToken = undefined;
    subscriber.confirmTokenExpire = undefined;
    await subscriber.save();

    res.status(200).json({ success: true, message: 'Subscription confirmed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
