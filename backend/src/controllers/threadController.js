// backend/src/controllers/threadController.js
const Thread = require('../models/Thread');
const Message = require('../models/Message');


exports.getThreads = async (req, res) => {
  try {
    const threads = await Thread.find({ participants: req.user.id })
      .sort('-lastMessageDate')
      .populate('participants', 'name')
      .populate('lastMessage');
    res.status(200).json({ success: true, data: threads });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getThreadById = async (req, res) => {
  try {
    const thread = await Thread.findOne({ 
      _id: req.params.id, 
      participants: req.user.id 
    }).populate('participants', 'name');
    
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Wątek nie znaleziony' });
    }
    
    const messages = await Message.find({ threadId: thread._id })
      .sort('createdAt')
      .populate('sender', 'name');
    
    console.log('Thread found:', thread);
    console.log('Messages found:', messages.length);

    res.status(200).json({ success: true, data: { thread, messages } });
  } catch (error) {
    console.error('Error in getThreadById:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.createThread = async (req, res) => {
  try {
    const { subject, recipientId, content, department } = req.body;
    if (!department) {
      return res.status(400).json({ success: false, message: 'Dział jest wymagany' });
    }
    const thread = new Thread({
      subject,
      participants: [req.user.id, recipientId],
      lastMessageDate: new Date(),
      department 
    });
    await thread.save();

    const message = new Message({
      thread: thread._id,
      sender: req.user.id,
      content,
      department
    });
    await message.save();

    thread.lastMessage = message._id;
    await thread.save();

    sendNotification(recipientId, { type: 'new_thread', threadId: thread._id });

    await sendEmail({
      email: adminUser.email,
      subject: `Nowy wątek`,
      message: `Nowy wątek.`
    });
    
    res.status(201).json({ success: true, data: { thread, message } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addMessageToThread = async (req, res) => {
  try {
    const thread = await Thread.findOne({ _id: req.params.id, participants: req.user.id });
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Wątek nie znaleziony' });
    }

    const message = new Message({
      thread: thread._id,
      sender: req.user.id,
      content: req.body.content
    });
    await message.save();

    thread.lastMessage = message._id;
    thread.lastMessageDate = new Date();
    await thread.save();

    const recipientId = thread.participants.find(p => p.toString() !== req.user.id.toString());
    sendNotification(recipientId, { type: 'new_message', threadId: thread._id, messageId: message._id });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.toggleThreadStatus = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Wątek nie znaleziony' });
    }

    thread.isOpen = !thread.isOpen;
    await thread.save();

    thread.participants.forEach(participantId => {
      if (participantId.toString() !== req.user.id.toString()) {
        sendNotification(participantId, { type: 'thread_status_change', threadId: thread._id, isOpen: thread.isOpen });
      }
    });

    res.status(200).json({ success: true, data: thread });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};