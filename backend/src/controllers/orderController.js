// backend/src/controllers/orderController.js
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { generateEmailTemplate } = require('../utils/emailTemplate');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const Invoice = require('../models/Invoice');
const { uploadSingle } = require('../utils/s3Upload');
const Payment = require('../models/Payment');
const OrderComment = require('../models/OrderComment');

exports.createOrder = async (req, res) => {
  try {
    const { orderItems, totalPrice, appliedDiscount, declaredDeliveryDate, userAttachments } = req.body;
    const userId = req.user.id;

    if (!orderItems || !Array.isArray(orderItems)) {
      return res.status(400).json({
        success: false,
        message: 'Nieprawidłowe dane zamówienia'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Użytkownik nie znaleziony'
      });
    }

    // Sprawdzamy, czy użytkownik ma wystarczające środki na koncie
    const missingAmount = Math.max(0, totalPrice - user.accountBalance);
    
    // Tworzymy zamówienie, ale jeszcze go nie zapisujemy
    const order = new Order({
      user: userId,
      items: orderItems.map(item => ({
        topic: item.topic,
        length: item.length,
        price: parseFloat((item.length * 0.018 * (1 - appliedDiscount / 100)).toFixed(2)),
        contentType: item.contentType,
        language: item.language,
        guidelines: item.guidelines
      })),
      totalPrice: parseFloat(totalPrice),
      appliedDiscount: appliedDiscount,
      status: missingAmount > 0 ? 'oczekujące' : 'w trakcie',
      paymentStatus: missingAmount > 0 ? 'pending' : 'paid',
      declaredDeliveryDate: new Date(declaredDeliveryDate),
      userAttachments: userAttachments
    });

    if (missingAmount > 0) {
      const actualMissingAmount = Math.max(missingAmount, 20);
      const extraTopUp = actualMissingAmount - missingAmount;
      const successUrl = `${process.env.FRONTEND_URL}/dashboard/orders?session_id={CHECKOUT_SESSION_ID}&success=true&orderNumber=${order.orderNumber}&totalPrice=${order.totalPrice}&discount=${appliedDiscount}&itemsCount=${orderItems.length}`;

      // Utworzenie sesji Stripe dla brakującej kwoty
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['blik', 'card', 'paypal'],
        line_items: [
          {
            price_data: {
              currency: 'pln',
              product_data: {
                name: 'Doładowanie konta i realizacja zamówienia',
                description: extraTopUp > 0 ? `Zawiera dodatkowe ${extraTopUp.toFixed(2)} zł doładowania konta` : undefined,
              },
              unit_amount: Math.round(actualMissingAmount * 100), // Stripe uses cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: `${process.env.FRONTEND_URL}/dashboard?order_canceled=true`,
        customer_email: user.email,
        metadata: {
          userId: user._id.toString(),
          type: 'order_payment',
          orderId: order._id.toString(),
          orderItems: JSON.stringify(orderItems),
          totalPrice: totalPrice,
          appliedDiscount: appliedDiscount,
          extraTopUp: extraTopUp,
          userToken: req.headers.authorization.split(' ')[1],
          declaredDeliveryDate: declaredDeliveryDate
        }
      });

      // Zapisujemy zamówienie
      await order.save();

      return res.status(200).json({
        success: true,
        paymentUrl: session.url,
        order: {
          ...order.toObject(),
          orderNumber: order.orderNumber,
          userAttachments: order.userAttachments
        }
      });
    }

    // Jeśli nie potrzeba płatności, finalizujemy zamówienie
    await order.save();
    console.log('Saved order:', order);

    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser && adminUser.email) {
      try {
        await sendEmail({
          email: adminUser.email,
          subject: 'Nowe zamówienie utworzone',
          message: `Nowe zamówienie nr ${order.orderNumber} zostało utworzone przez użytkownika ${user.name}. Zaloguj się do panelu administracyjnego, aby zobaczyć szczegóły.`
        });
        console.log('E-mail wysłany do admina');
      } catch (emailError) {
        console.error('Błąd podczas wysyłania e-maila do admina:', emailError);        
      }
    } else {
      console.error('Nie można wysłać e-maila: brak adresu e-mail admina');
    }

    // Wysyłka e-maila do użytkownika
    const emailContent = `
    <h2>Potwierdzenie zamówienia #${order.orderNumber}</h2>
    <p>Dziękujemy za złożenie zamówienia nr ${order.orderNumber}.</p>
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
      content: emailContent
    };
  
    const emailHtml = generateEmailTemplate(emailData);
  
    try {
      await sendEmail({
        email: user.email,
        subject: `eCopywriting.pl - potwierdzenie zamówienia #${order.orderNumber}`,
        message: emailHtml,
        isHtml: true
      });
      console.log('E-mail z potwierdzeniem wysłany do użytkownika');
    } catch (emailError) {
      console.error('Błąd podczas wysyłania e-maila do użytkownika:', emailError);
    }
  
    // Odejmowanie kwoty od salda użytkownika
    user.accountBalance -= parseFloat(totalPrice);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Zamówienie utworzone i opłacone z salda konta',
      order: {
        ...order.toObject(),
        orderNumber: order.orderNumber,
        userAttachments: order.userAttachments
      },
      remainingBalance: user.accountBalance
    });
  } catch (error) {
    console.error('Błąd podczas tworzenia zamówienia:', error);
    res.status(500).json({
      success: false,
      message: 'Wystąpił błąd podczas tworzenia zamówienia',
      error: error.message,
    });
  }
};

exports.updateActualDeliveryDate = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { actualDeliveryDate } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { actualDeliveryDate: new Date(actualDeliveryDate), status: 'zakończone' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Zamówienie nie znalezione' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error('Błąd podczas aktualizacji daty dostarczenia:', error);
    res.status(500).json({ success: false, message: 'Wystąpił błąd serwera', error: error.message });
  }
};

exports.payForOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const { amount } = req.body;

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Zamówienie nie znalezione' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Użytkownik nie znaleziony' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['blik', 'card', 'paypal'],
      line_items: [
        {
          price_data: {
            currency: 'pln',
            product_data: {
              name: 'Opłata za zamówienie',
            },
            unit_amount: Math.round(amount * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${process.env.FRONTEND_URL}/dashboard?order_canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user._id.toString(),
        orderId: order._id.toString(),
        userToken: req.headers.authorization.split(' ')[1],
        type: 'order_payment'
      }
    });

    res.status(200).json({
      success: true,
      paymentUrl: session.url
    });
  } catch (error) {
    console.error('Błąd podczas tworzenia sesji płatności:', error);
    res.status(500).json({
      success: false,
      message: 'Wystąpił błąd podczas przetwarzania płatności',
      error: error.message,
    });
  }
};


exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

    const unreadNotifications = await Notification.find({
      user: req.user.id,
      isRead: false
    }).distinct('order');

    const ordersWithNotificationInfo = orders.map(order => ({
      ...order.toObject(),
      orderNumber: order.orderNumber,      
      hasUnreadNotifications: unreadNotifications.some(id => id.equals(order._id)),
      userAttachments: order.userAttachments
    }));

    res.json({ success: true, data: ordersWithNotificationInfo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Błąd pobierania zamówień', error: error.message });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Zamówienie nie znalezione' });
    }
  
    // Sprawdź, czy nadal istnieją nieprzeczytane powiadomienia dla tego zamówienia
    const unreadNotificationsExist = await Notification.exists({
      order: orderId,
      user: userId,
      isRead: false
    });

    const orderWithNotificationInfo = {
      ...order.toObject(),
      hasUnreadNotifications: !!unreadNotificationsExist
    };

    res.json({ success: true, data: orderWithNotificationInfo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Błąd pobierania szczegółów zamówienia', error: error.message });
  }
};


exports.getOrderInvoice = async (req, res) => {
  try {
    const orderId = req.params.id;
    console.log('Próba pobrania faktury dla zamówienia:', orderId);
    
    if (!orderId || orderId === 'undefined') {
      return res.status(400).json({ success: false, message: 'Brak lub nieprawidłowy identyfikator zamówienia' });
    }

    const order = await Order.findOne({ _id: orderId, user: req.user.id });

    if (!order) {
      console.log('Zamówienie nie znalezione');
      return res.status(404).json({ success: false, message: 'Zamówienie nie znalezione' });
    }

    const invoice = await Invoice.findOne({ order: orderId });
    if (!invoice) {
      console.log('Faktura nie znaleziona');
      return res.status(404).json({ success: false, message: 'Faktura nie znaleziona' });
    }

    if (order.paymentStatus !== 'paid') {
      console.log('Zamówienie nie zostało opłacone');
      return res.status(400).json({ success: false, message: 'Zamówienie nie zostało opłacone' });
    }

    if (!invoice.pdfUrl) {
      // Jeśli nie mamy zapisanego URL PDF, pobieramy go ze Stripe
      const stripeInvoice = await stripe.invoices.retrieve(invoice.stripeInvoiceId);
      invoice.pdfUrl = stripeInvoice.invoice_pdf;
      await invoice.save();
    }

    res.json({
      success: true,
      invoiceUrl: invoice.pdfUrl
    });
  } catch (error) {
    console.error('Błąd podczas pobierania linku do faktury:', error);
    res.status(500).json({ success: false, message: 'Błąd serwera', error: error.message });
  }
};



exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ order: req.params.id }).populate('order');
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Faktura nie znaleziona' });
    }

    // Tutaj możesz dodać logikę generowania PDF z faktury
    // Dla przykładu zwracamy dane faktury
    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Błąd podczas pobierania faktury:', error);
    res.status(500).json({ success: false, message: 'Błąd serwera', error: error.message });
  }
};

exports.resumePayment = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Zamówienie nie znalezione' });
    }

    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'To zamówienie nie oczekuje na płatność' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Użytkownik nie znaleziony' });
    }

    

    // Tworzenie nowej sesji Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'blik', 'paypal'],
      customer: user.stripeCustomerId,
      client_reference_id: order._id.toString(),
      line_items: [
        {
          price_data: {
            currency: 'pln',
            product_data: {
              name: 'Zamówienie treści',
            },
            unit_amount: Math.round(order.totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/orders?canceled=true`,
      metadata: {
        orderId: order._id.toString(),
        userToken: req.headers.authorization.split(' ')[1]
      },
    });

    res.status(200).json({
      success: true,
      message: 'Nowa sesja płatności utworzona',
      sessionId: session.id,
      sessionUrl: session.url,
    });
  } catch (error) {
    console.error('Błąd podczas wznawiania płatności:', error);
    res.status(500).json({
      success: false,
      message: 'Wystąpił błąd podczas wznawiania płatności',
      error: error.message,
    });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Zamówienie nie znalezione' });
    }

    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Można usunąć tylko zamówienia oczekujące na płatność' });
    }

    await Order.deleteOne({ _id: req.params.id });
    
    res.status(200).json({ success: true, message: 'Zamówienie zostało usunięte' });
  } catch (error) {
    console.error('Błąd podczas usuwania zamówienia:', error);
    res.status(500).json({ success: false, message: 'Wystąpił błąd podczas usuwania zamówienia' });
  }
};

exports.getLatestOrder = async (req, res) => {
  try {
    const latestOrder = await Order.findOne({ user: req.user.id }).sort('-createdAt');
    if (!latestOrder) {
      return res.status(404).json({ success: false, message: 'Nie znaleziono żadnych zamówień' });
    }

    const payment = await Payment.findOne({ relatedOrder: latestOrder._id });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Nie znaleziono płatności dla zamówienia' });
    }

    res.json({
      success: true,
      orderId: latestOrder._id,
      totalPrice: latestOrder.totalPrice,
      paidAmount: payment.paidAmount,
      appliedDiscount: latestOrder.appliedDiscount,
      remainingBalance: req.user.accountBalance,
      stripeSessionId: payment.stripeSessionId // Dodajemy to pole
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Błąd serwera', error: error.message });
  }
};


exports.addComment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Zamówienie nie znalezione' });
    }

    const comment = new OrderComment({
      order: orderId,
      user: userId,
      content,
      isAdminComment: false
    });

    if (req.files && req.files.length > 0) {
      comment.attachments = req.files.map(file => ({
        filename: file.originalname,
        url: file.location,
        uploadDate: new Date()
      }));
    }

    await comment.save();

    // Notify admin
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      

      // Send email to admin
      await sendEmail({
        email: adminUser.email,
        subject: `Nowy komentarz do zamówienia #${order.orderNumber}`,
        message: `Użytkownik dodał nowy komentarz do zamówienia #${order.orderNumber}. Zaloguj się do panelu administracyjnego, aby zobaczyć szczegóły.`
      });
    }

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    console.error('Błąd podczas dodawania komentarza:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { orderId } = req.params;
    const comments = await OrderComment.find({ order: orderId })
      .sort('createdAt')
      .populate('user', 'name');

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    console.error('Błąd podczas pobierania komentarzy:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getRecentOrders = async (req, res) => {
  try {
    const recentOrders = await Order.find({ user: req.user.id })
      .sort('-createdAt')
      .limit(3)
      .select('items.topic totalPrice status createdAt');

    res.status(200).json({ success: true, data: recentOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Nie udało się pobrać ostatnich zamówień', error: error.message });
  }
};

exports.getOrderBySessionId = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const payment = await Payment.findOne({ stripeSessionId: sessionId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    const order = await Order.findById(payment.relatedOrder);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({
      success: true,
      orderNumber: order.orderNumber,
      totalPrice: order.totalPrice,
      appliedDiscount: order.appliedDiscount,
      items: order.items,
      paymentId: payment._id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};