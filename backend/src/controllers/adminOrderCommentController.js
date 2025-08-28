// backend/src/controllers/adminOrderCommentController.js
const Order = require('../models/Order');
const OrderComment = require('../models/OrderComment');
const User = require('../models/User');
const { generateEmailTemplate } = require('../utils/emailTemplate');
const sendEmail = require('../utils/sendEmail');
const Notification = require('../models/Notification');

exports.getOrderComments = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('Fetching comments for order:', orderId);
    const comments = await OrderComment.find({ order: orderId })
      .sort('createdAt')
      .populate('user', 'name');
    console.log('Found comments:', comments);
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    console.error('Błąd podczas pobierania komentarzy:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addOrderComment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const order = await Order.findById(orderId).populate('user', 'email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Zamówienie nie znalezione' });
    }

    console.log('Found order:', order);
    console.log('Order number:', order.orderNumber);

    const comment = new OrderComment({
      order: orderId,
      user: userId,
      content,
      isAdminComment: true
    });

    if (req.files && req.files.length > 0) {
      comment.attachments = req.files.map(file => ({
        filename: file.originalname,
        url: file.location
      }));
    }

    await comment.save();

    // Tworzenie powiadomienia
    const notification = new Notification({
      user: order.user._id,
      order: orderId,      
      type: 'new_admin_comment',
      message: `Dodano komentarz do zamówienia nr #${order.orderNumber}`,
      orderNumber: order.orderNumber,
      isRead: false,
      createdAt: new Date()            
    });

    await notification.save();

    console.log('Created notification:', notification);


    //Wysyłanie e-maila do użytkownika
    if (order.user && order.user.email) {
      const emailContent = `
        <h2>Nowy komentarz do zamówienia</h2>
        <p>Dodano nowy komentarz do Twojego zamówienia #${order.orderNumber}.</p>
        <p>Zaloguj się do <a href="${process.env.FRONTEND_URL}/dashboard/orders/${order._id}" class="button">panelu klienta</a>, aby zobaczyć szczegóły.</p>
      `;

      const emailData = {
        title: 'eCopywriting.pl',
        headerTitle: 'eCopywriting.pl',
        content: emailContent
      };

      const emailHtml = generateEmailTemplate(emailData);

      await sendEmail({
        email: order.user.email,
        subject: `eCopywriting.pl - dodano komentarz do zamówienia #${order.orderNumber}`,
        message: emailHtml,
        isHtml: true
      });
    }

    const populatedComment = await OrderComment.findById(comment._id).populate('user', 'name');

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    console.error('Błąd podczas dodawania komentarza:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};