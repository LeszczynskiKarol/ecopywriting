// backend/src/controllers/notificationController.js
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');
const sseClients = new Map();

exports.getUserNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await Notification.countDocuments({ user: req.user.id });

    const notifications = await Notification.find({ user: req.user.id })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('order', 'status');

    const notificationsWithFileInfo = notifications.map((notification) => {
      if (notification.type === 'file_added' && notification.file) {
        return {
          ...notification.toObject(),
          file: {
            filename: notification.file.filename,
            url: notification.file.url,
          },
        };
      }
      return notification;
    });

    res.status(200).json({
      success: true,
      data: notificationsWithFileInfo,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.toggleNotificationStatus = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, error: 'Powiadomienie nie znalezione' });
    }

    notification.isRead = !notification.isRead;
    const updatedNotification = await notification.save();

    console.log('Updated notification:', updatedNotification);

    // Aktualizuj liczbę nieprzeczytanych powiadomień
    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: updatedNotification,
      unreadCount: unreadCount,
    });
  } catch (error) {
    console.error('Error in toggleNotificationStatus:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },

      { isRead: true },

      { new: true }
    );

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, error: 'Powiadomienie nie znalezione' });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );
    res
      .status(200)
      .json({
        success: true,
        message: 'Wszystkie powiadomienia oznaczone jako przeczytane',
      });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.markNotificationsAsReadForOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await Notification.updateMany(
      { order: orderId, user: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    console.log(
      `Oznaczono ${result.nModified} powiadomień jako przeczytane dla zamówienia ${orderId}`
    );
    res.status(200).json({
      success: true,
      message: 'Powiadomienia oznaczone jako przeczytane',
      modifiedCount: result.nModified,
    });
  } catch (error) {
    console.error(
      'Błąd podczas oznaczania powiadomień jako przeczytane:',
      error
    );
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.sseNotifications = (req, res) => {
  const token = req.query.token;
  if (!token) {
    console.error('No token provided for SSE');
    return res.status(401).send('Unauthorized: No token provided');
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(401).send('Unauthorized: Invalid token');
    }
    req.user = decoded;
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    const sendSSE = (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };
    // Dodaj klienta do listy połączeń SSE
    const clientId = req.user.id;
    sseClients.set(clientId, sendSSE);
    req.on('close', () => {
      sseClients.delete(clientId);
    });
  });
};

exports.sendNotificationSSE = (userId, notification) => {
  const sendSSE = sseClients.get(userId);
  if (sendSSE) {
    sendSSE(notification);
  }
};

exports.markNotificationsAsReadForOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    await Notification.updateMany(
      { order: orderId, user: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res
      .status(200)
      .json({
        success: true,
        message: 'Powiadomienia oznaczone jako przeczytane',
      });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUnreadNotificationsCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
    });
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
