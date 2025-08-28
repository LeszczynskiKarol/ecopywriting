// backend/src/utils/websocket.js
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');

let io;

function setupWebSocket(server) {
  io = socketIo(server, {
    path: '/socket.io',
    cors: {
      origin: ['https://ecopywriting.pl', 'https://www.ecopywriting.pl'],
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use((socket, next) => {
    console.log('New connection attempt');
    if (socket.handshake.auth && socket.handshake.auth.token) {
      console.log('Token provided:', socket.handshake.auth.token);
      jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          console.log('No token provided');
          console.error('WebSocket authentication error:', err);
          return next(new Error('Authentication error'));
        }
        socket.user = decoded;
        next();
      });
    } else {
      console.error('No token provided for WebSocket connection');
      next(new Error('Authentication error'));
    }
  });

  io.on('connect_error', (err) => {
    console.log('Błąd połączenia Socket.IO:', err);
  });
  
  

  io.on('connection', (socket) => {
    console.log('New WebSocket connection:', socket.id);
    console.log('User data:', socket.user);
  
    socket.on('join_user_room', (userId) => {
      console.log(`User ${userId} attempting to join room`);
        if (userId && socket.user && socket.user.id === userId) {
        socket.join(userId);
        console.log(`User joined room: ${userId}`);
        sendUnreadNotifications(userId);
      } else {
        console.log('Attempted to join room with invalid userId');
      }
    });
  
    socket.on('leave_user_room', (userId) => {
      if (userId) {
        socket.leave(userId);
        console.log(`User left room: ${userId}`);
      }
    });

    socket.on('join_thread', (threadId) => {
      socket.join(threadId);
      console.log(`User joined thread: ${threadId}`);
    });

    socket.on('leave_thread', (threadId) => {
      socket.leave(threadId);
      console.log(`User left thread: ${threadId}`);
    });

    socket.on('disconnect', (reason) => {
      console.log('User disconnected:', socket.id, 'Reason:', reason);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    console.warn('Socket.io not initialized!');
    return null;
  }
  return io;
}

function sendNotification(userId, notification) {
  console.log('Attempting to send notification:', userId, notification);
  const currentIo = getIO();
  if (!currentIo) {
    console.warn('Socket.io not initialized, cannot send notification');
    return;
  }
  console.log(`Sending notification to user: ${userId}`, notification);

  switch (notification.type) {
    case 'thread_status_change':
      currentIo.to(userId.toString()).emit('thread_status_change', {
        threadId: notification.threadId,
        isRead: false,
        isOpen: notification.isOpen,
        subject: notification.subject,
        message: notification.message,
        threadUrl: notification.threadUrl 
      });
      break;
      case 'new_admin_comment':
        console.log('Sending new_admin_comment notification:', notification);
        currentIo.to(userId.toString()).emit('notification', {
          ...notification,
          isRead: false,
          orderId: notification.orderId || notification.order,
          orderNumber: notification.orderNumber
        });  
          break;
  
      case 'file_added':
      currentIo.to(userId.toString()).emit('notification', {
    type: 'file_added',
    orderId: notification.order,
    file: notification.file,
    isRead: false,
    message: notification.message
  });
  break;
  case 'new_admin_comment':
    currentIo.to(userId.toString()).emit('notification', {
      type: notification.type,
      orderId: notification.orderId,
      isRead: false,
      orderNumber: notification.orderNumber,
      message: notification.message,
      createdAt: notification.createdAt
    });
    break;

    case 'order_status_change':
      currentIo.to(userId.toString()).emit('notification', {
        type: 'order_status_change',
        orderId: notification.orderId,
        isRead: false,
        newStatus: notification.newStatus
      });
      break;
    default:
      currentIo.to(userId.toString()).emit('notification', notification);
  }
  sendUnreadCount(userId);
}

async function sendUnreadCount(userId) {
  const unreadCount = await Notification.countDocuments({ userId, isRead: false });
  const currentIo = getIO();
  if (currentIo) {
    currentIo.to(userId.toString()).emit('unreadCount', { count: unreadCount });
  }
}



async function sendUnreadNotifications(userId) {
  try {
    // Pobierz nieprzeczytane powiadomienia z bazy danych
    const unreadNotifications = await Notification.find({ 
      userId: userId, 
      isRead: false 
    }).sort({ createdAt: -1 }).limit(20); // Ograniczamy do 20 najnowszych

    const io = getIO();
    if (!io) {
      console.warn('Socket.io not initialized, cannot send unread notifications');
      return;
    }

    // Wyślij każde nieprzeczytane powiadomienie do użytkownika
    unreadNotifications.forEach(notification => {
      io.to(userId.toString()).emit('notification', {
        _id: notification._id,
        type: notification.type,
        message: notification.message,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        thread: notification.thread,
        subject: notification.subject,
        isOpen: notification.isOpen
      });
    });

    console.log(`Sent ${unreadNotifications.length} unread notifications to user ${userId}`);
  } catch (error) {
    console.error(`Error sending unread notifications to user ${userId}:`, error);
  }
}

function sendOrderStatusNotification(userId, orderId, newStatus) {
  const currentIo = getIO();
  if (!currentIo) {
    console.warn('Socket.io not initialized, cannot send order status notification');
    return;
  }
  const notification = {
    type: 'order_status_change',
    orderId,
    orderNumber,
    newStatus
  };
  console.log(`Sending order status notification to user: ${userId}`, notification);
  currentIo.to(userId.toString()).emit('notification', notification);
}

function sendFileAddedNotification(userId, orderId, orderNumber, fileInfo) {
  const currentIo = getIO();
  if (!currentIo) {
    console.warn('Socket.io not initialized, cannot send file added notification');
    return;
  }
  const notification = {
    type: 'file_added',
    orderId,
    orderNumber,
    file: fileInfo,
    message: `Dodano plik do zamówienia nr ${orderNumber}.`,
    createdAt: new Date().toISOString()
  };
  console.log(`Sending file added notification to user: ${userId}`, notification);
  currentIo.to(userId.toString()).emit('notification', notification);
}
function sendOrderStatusChangeNotification(userId, orderId, orderNumber, newStatus, orderUrl) {
  const currentIo = getIO();
  if (!currentIo) {
    console.warn('Socket.io not initialized, cannot send order status change notification');
    return;
  }
  const notification = {
    type: 'order_status_change',
    orderId,
    orderNumber,
    newStatus,
    orderUrl,
    createdAt: new Date().toISOString()
  };
  console.log(`Sending order status change notification to user: ${userId}`, notification);
  currentIo.to(userId.toString()).emit('notification', notification);
}

module.exports = { 
  setupWebSocket, 
  getIO, 
  sendNotification,
  sendUnreadNotifications,
  sendFileAddedNotification,
  sendOrderStatusNotification,
  sendOrderStatusChangeNotification 
};