// backend/src/controllers/stripeWebhookController.js
const Payment = require('../models/Payment');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const sendEmail = require('../utils/sendEmail');
const { generateEmailTemplate } = require('../utils/emailTemplate');

async function updateStripeCustomer(user) {
  if (!user.stripeCustomerId) {
    console.log('Creating new Stripe customer for user:', user._id);
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.companyDetails?.companyName || user.name,
      metadata: {
        userId: user._id.toString(),
      },
    });
    user.stripeCustomerId = customer.id;
    await user.save();
  }

  console.log('Updating Stripe customer:', user.stripeCustomerId);
  await stripe.customers.update(user.stripeCustomerId, {
    name: user.companyDetails?.companyName || user.name,
    email: user.email,
    address: {
      line1: `NIP nabywcy: ${user.companyDetails?.nip || 'brak'}`,
      line2: `${user.companyDetails?.address || ''} ${user.companyDetails?.buildingNumber || ''}`,
      postal_code: user.companyDetails?.postalCode || '',
      city: user.companyDetails?.city || '',
      country: 'PL',
    },
  });
}

async function createStripeInvoice(user, discountedAmount, originalAmount) {
  await updateStripeCustomer(user);

  const stripeInvoice = await stripe.invoices.create({
    customer: user.stripeCustomerId,
    auto_advance: true,
    collection_method: 'charge_automatically',
    custom_fields: [{ name: 'NIP sprzedawcy:', value: '9562203948' }],
  });

  await stripe.invoiceItems.create({
    customer: user.stripeCustomerId,
    amount: Math.round(discountedAmount * 100),
    currency: 'pln',
    invoice: stripeInvoice.id,
    description: `Doładowanie konta w eCopywriting.pl`,
  });

  return stripeInvoice;
}

async function generateInvoiceNumber() {
  const currentYear = new Date().getFullYear();
  const lastInvoice = await Invoice.findOne(
    {},
    {},
    { sort: { invoiceNumber: -1 } }
  );
  let lastNumber = 0;
  if (lastInvoice && lastInvoice.invoiceNumber) {
    const parts = lastInvoice.invoiceNumber.split('/');
    if (parts.length === 3 && parts[1] === currentYear.toString()) {
      lastNumber = parseInt(parts[2], 10);
    }
  }
  return `FV/${currentYear}/${(lastNumber + 1).toString().padStart(6, '0')}`;
}

async function handleAccountTopUp(session) {
  const userId = session.metadata.userId;
  const originalAmount = parseFloat(session.metadata.originalAmount);
  const discountedAmount = parseFloat(session.metadata.discountedAmount);
  const appliedDiscount = parseFloat(session.metadata.appliedDiscount);

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error(`Nie znaleziono użytkownika o ID ${userId}`);
      return;
    }

    // Sprawdź, czy originalAmount jest prawidłową liczbą
    if (isNaN(originalAmount)) {
      throw new Error('Invalid originalAmount');
    }

    // Aktualizacja salda o oryginalną kwotę doładowania
    const newBalance = (user.accountBalance || 0) + originalAmount;
    user.accountBalance = newBalance;
    await user.save();

    // Tworzenie rekordu płatności
    const payment = await Payment.create({
      user: userId,
      amount: originalAmount,
      paidAmount: discountedAmount,
      type: 'top_up',
      status: 'completed',
      stripeSessionId: session.id,
      stripeInvoiceId: session.invoice,
      appliedDiscount: appliedDiscount,
      metadata: {
        originalAmount: originalAmount,
        discountedAmount: discountedAmount,
        stripePaymentIntentId: session.payment_intent,
      },
    });

    // Użyj nowej funkcji createStripeInvoice
    const stripeInvoice = await createStripeInvoice(
      user,
      discountedAmount,
      originalAmount
    );
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(
      stripeInvoice.id
    );
    const pdfUrl = finalizedInvoice.invoice_pdf;

    // Tworzenie lokalnej faktury
    const localInvoice = await Invoice.create({
      invoiceNumber: await generateInvoiceNumber(),
      user: userId,
      payment: payment._id,
      amount: originalAmount,
      paidAmount: discountedAmount,
      status: 'paid',
      paidDate: new Date(),
      stripeInvoiceId: finalizedInvoice.id,
      pdfUrl: pdfUrl,
    });

    console.log(
      `Konto użytkownika ${userId} zostało doładowane o ${originalAmount} zł (zapłacono ${discountedAmount} zł)`
    );
  } catch (error) {
    console.error('Błąd podczas doładowywania konta:', error);
  }
}

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Błąd weryfikacji webhooka:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    if (session.metadata.type === 'account_top_up') {
      await handleAccountTopUp(session);
    } else if (session.metadata.type === 'order_payment') {
      await handleOrderPaymentAndTopUp(session);
    } else if (session.metadata.orderId) {
      await handleOrderPayment(session);
    }
  }

  res.json({ received: true });
};

async function handleOrderPaymentAndTopUp(session) {
  const userId = session.metadata.userId;
  const orderId = session.metadata.orderId;
  const paidAmount = session.amount_total / 100;
  const totalPrice = parseFloat(session.metadata.totalPrice);
  const appliedDiscount = parseFloat(session.metadata.appliedDiscount);
  const extraTopUp = parseFloat(session.metadata.extraTopUp || 0);

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error(`Nie znaleziono użytkownika o ID ${userId}`);
      return;
    }

    await updateStripeCustomer(user);

    const remainingBalance = paidAmount - totalPrice;
    user.accountBalance += remainingBalance;
    await user.save();

    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`Nie znaleziono zamówienia o ID ${orderId}`);
      return;
    }

    order.status = 'w trakcie';
    order.paymentStatus = 'paid';
    await order.save();

    // Tworzenie faktury w Stripe
    const stripeInvoice = await createStripeInvoice(
      user,
      paidAmount,
      totalPrice
    );
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(
      stripeInvoice.id
    );
    const invoicePdfUrl = finalizedInvoice.invoice_pdf;

    // Tworzenie rekordu płatności
    const payment = await Payment.create({
      user: userId,
      amount: paidAmount,
      paidAmount: paidAmount,
      type: 'order_payment',
      status: 'completed',
      stripeSessionId: session.id,
      stripeInvoiceId: finalizedInvoice.id,
      relatedOrder: order._id,
      metadata: {
        originalOrderTotal: totalPrice,
        extraTopUp: extraTopUp,
        stripePaymentIntentId: session.payment_intent,
      },
    });

    // Tworzenie lokalnej faktury
    const invoiceNumber = await generateInvoiceNumber();
    const invoice = new Invoice({
      invoiceNumber,
      order: order._id,
      user: userId,
      payment: payment._id,
      amount: totalPrice,
      paidAmount: paidAmount,
      status: 'paid',
      paidDate: new Date(),
      stripeInvoiceId: finalizedInvoice.id,
      pdfUrl: invoicePdfUrl,
    });
    await invoice.save();

    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser && adminUser.email) {
      try {
        await sendEmail({
          email: adminUser.email,
          subject: 'Nowe zamówienie opłacone',
          message: `Zamówienie nr ${order.orderNumber} zostało opłacone przez użytkownika ${user.name}. Zaloguj się do panelu administracyjnego, aby zobaczyć szczegóły.`,
        });
        console.log('E-mail wysłany do admina');
      } catch (emailError) {
        console.error('Błąd podczas wysyłania e-maila do admina:', emailError);
      }
    }

    // Wysyłanie e-maila do klienta
    const emailContent = `
    <h2>Potwierdzenie opłacenia zamówienia #${order.orderNumber}</h2>
    <p>Dziękujemy za opłacenie zamówienia nr ${order.orderNumber}.</p>
    <h3>Szczegóły zamówienia:</h3>
    <ul>
      <li>Całkowita cena: ${order.totalPrice.toFixed(2)} zł</li>
      <li>Liczba zamówionych artykułów: ${order.items.length}</li>
      <li>Przewidywana data realizacji: ${new Date(order.declaredDeliveryDate).toLocaleDateString()}</li>
    </ul>
    <p>Możesz śledzić status swojego zamówienia <a href="${process.env.FRONTEND_URL}/dashboard/orders/${order._id}" class="button">logując się do panelu klienta</a>.</p>
    <p>W razie jakichkolwiek pytań prosimy o kontakt.</p>
    <p>Pozdrawiamy,<br>Zespół eCopywriting.pl</p>
    `;

    const emailData = {
      title: 'eCopywriting.pl',
      headerTitle: 'eCopywriting.pl',
      content: emailContent,
    };

    const emailHtml = generateEmailTemplate(emailData);

    try {
      await sendEmail({
        email: user.email,
        subject: `eCopywriting.pl - potwierdzenie opłacenia zamówienia #${order.orderNumber}`,
        message: emailHtml,
        isHtml: true,
      });
      console.log('E-mail z potwierdzeniem wysłany do użytkownika');
    } catch (emailError) {
      console.error(
        'Błąd podczas wysyłania e-maila do użytkownika:',
        emailError
      );
    }

    console.log(
      `Zamówienie ${orderId} zaktualizowane i opłacone dla użytkownika ${userId}. Doładowano: ${paidAmount} zł, koszt zamówienia: ${totalPrice} zł, pozostało na koncie: ${remainingBalance} zł`
    );
  } catch (error) {
    console.error('Błąd podczas przetwarzania płatności za zamówienie:', error);
  }
}

async function handleOrderPayment(session) {
  const orderId = session.metadata.orderId;

  try {
    const order = await Order.findById(orderId);
    if (order) {
      order.paymentStatus = 'paid';
      order.status = 'w trakcie';
      await order.save();

      // Aktualizacja lub tworzenie płatności
      let payment = await Payment.findOne({ relatedOrder: orderId });
      if (payment) {
        payment.status = 'completed';
        payment.stripeInvoiceId = session.invoice;
        await payment.save();
      } else {
        payment = await Payment.create({
          user: order.user,
          amount: order.totalPrice,
          paidAmount: order.totalPrice,
          type: 'order_payment',
          status: 'completed',
          stripeSessionId: session.id,
          stripeInvoiceId: session.invoice,
          relatedOrder: orderId,
        });
      }

      const invoice = await Invoice.findOne({ order: orderId });
      if (invoice) {
        invoice.status = 'paid';
        invoice.paidDate = new Date();
        invoice.stripeInvoiceId = session.invoice;
        await invoice.save();
      }

      if (session.invoice) {
        await stripe.invoices.pay(session.invoice);
      }

      console.log(`Zamówienie ${orderId} zostało opłacone i zaktualizowane`);
    } else {
      console.error(`Nie znaleziono zamówienia o ID ${orderId}`);
    }
  } catch (error) {
    console.error('Błąd podczas przetwarzania płatności za zamówienie:', error);
  }
}

exports.getSessionDetails = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const user = await User.findById(session.metadata.userId);
    if (user) {
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
      res.json({ success: true, token });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getSessionToken = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata.userId) {
      const user = await User.findById(session.metadata.userId);
      if (user) {
        const token = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRE }
        );
        res.cookie('auth_token', token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Lax',
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });
        res.json({ success: true, token });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } else {
      res.status(404).json({ message: 'User ID not found in session' });
    }
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
