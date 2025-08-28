// backend/src/controllers/paymentController.js
const Payment = require('../models/Payment');
const User = require('../models/User');
const Order = require('../models/Order');
const Invoice = require('../models/Invoice');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getPaymentInvoice = async (req, res) => {
  try {
    const sessionId = req.params.id;
    console.log('Próba pobrania faktury dla sesji płatności:', sessionId);
    
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Brak identyfikatora sesji płatności' });
    }

    const payment = await Payment.findOne({ stripeSessionId: sessionId });
    console.log('Znaleziona płatność:', payment);

    if (!payment) {
      console.log('Płatność nie znaleziona');
      return res.status(404).json({ success: false, message: 'Płatność nie znaleziona' });
    }

    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Brak dostępu do tej płatności' });
    }

    let invoice = await Invoice.findOne({ payment: payment._id });

    if (!invoice) {
      console.log('Faktura nie znaleziona, próba pobrania ze Stripe');
      if (!payment.stripeInvoiceId) {
        return res.status(400).json({ success: false, message: 'Brak ID faktury Stripe' });
      }

      try {
        const stripeInvoice = await stripe.invoices.retrieve(payment.stripeInvoiceId);
        invoice = new Invoice({
          invoiceNumber: await generateInvoiceNumber(),
          user: payment.user,
          payment: payment._id,
          amount: payment.amount,
          paidAmount: payment.paidAmount,
          status: 'paid',
          paidDate: new Date(stripeInvoice.status_transitions.paid_at * 1000),
          stripeInvoiceId: payment.stripeInvoiceId,
          pdfUrl: stripeInvoice.invoice_pdf
        });
        await invoice.save();
      } catch (stripeError) {
        console.error('Błąd podczas pobierania faktury ze Stripe:', stripeError);
        return res.status(500).json({ success: false, message: 'Nie udało się pobrać faktury ze Stripe' });
      }
    }

    if (!invoice.pdfUrl) {
      return res.status(400).json({ success: false, message: 'Brak URL PDF faktury' });
    }

    console.log('Zwracanie URL faktury:', invoice.pdfUrl);
    res.json({
      success: true,
      invoiceUrl: invoice.pdfUrl
    });
  } catch (error) {
    console.error('Błąd podczas pobierania linku do faktury:', error);
    res.status(500).json({ success: false, message: 'Błąd serwera', error: error.message });
  }
};


// Funkcja do generowania numeru faktury
async function generateInvoiceNumber() {
  const currentYear = new Date().getFullYear();
  const lastInvoice = await Invoice.findOne({}, {}, { sort: { 'invoiceNumber': -1 } });
  let lastNumber = 0;
  if (lastInvoice && lastInvoice.invoiceNumber) {
    const parts = lastInvoice.invoiceNumber.split('/');
    if (parts.length === 3 && parts[1] === currentYear.toString()) {
      lastNumber = parseInt(parts[2], 10);
    }
  }
  return `FV/${currentYear}/${(lastNumber + 1).toString().padStart(6, '0')}`;
}

exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .sort('-createdAt')
      .populate('relatedOrder');
    
    const paymentHistory = await Promise.all(payments.map(async (payment) => {
      let invoice = null;
      if (payment.type === 'order_payment') {
        invoice = await Invoice.findOne({ order: payment.relatedOrder });
      } else {
        invoice = await Invoice.findOne({ payment: payment._id });
      }

      return {
        ...payment.toObject(),
        invoice: invoice ? { id: invoice._id, invoiceNumber: invoice.invoiceNumber } : null
      };
    }));

    res.status(200).json({ success: true, data: paymentHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Nie udało się pobrać historii płatności', error: error.message });
  }
};

exports.getPaymentDetails = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Nie znaleziono płatności' });
    }
    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Brak dostępu do tej płatności' });
    }
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Nie udało się pobrać szczegółów płatności' });
  }
};

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'pln',
      metadata: { userId: req.user.id }
    });
    res.status(200).json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Nie udało się utworzyć intencji płatności' });
  }
};

// backend/src/controllers/paymentController.js

// ... (pozostałe funkcje pozostają bez zmian)

exports.getRecentInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('payment', 'stripeSessionId')
      .lean();

    const formattedInvoices = invoices.map(invoice => ({
      _id: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.totalAmount || invoice.amount,
      status: invoice.status,
      createdAt: invoice.createdAt,
      stripeSessionId: invoice.payment ? invoice.payment.stripeSessionId : null,
      pdfUrl: invoice.pdfUrl
    }));

    res.status(200).json({
      success: true,
      data: formattedInvoices
    });
  } catch (error) {
    console.error('Error fetching recent invoices:', error);
    res.status(500).json({
      success: false,
      error: 'Nie udało się pobrać ostatnich faktur'
    });
  }
};
