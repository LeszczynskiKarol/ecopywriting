// backend/src/controllers/adminMessageController.js
const Message = require('../models/Message');

exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort('-createdAt').populate('sender', 'name').populate('recipient', 'name');
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id).populate('sender', 'name').populate('recipient', 'name');
    if (!message) {
      return res.status(404).json({ success: false, error: 'Wiadomość nie znaleziona' });
    }
    res.status(200).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, error: 'Wiadomość nie znaleziona' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.closeThread = async (req, res) => {
  try {
    const thread = await Thread.findByIdAndUpdate(req.params.id, { isOpen: false }, { new: true });
    if (!thread) {
      return res.status(404).json({ success: false, error: 'Wątek nie znaleziony' });
    }
    res.status(200).json({ success: true, data: thread });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.reopenThread = async (req, res) => {
  try {
    const thread = await Thread.findByIdAndUpdate(req.params.id, { isOpen: true }, { new: true });
    if (!thread) {
      return res.status(404).json({ success: false, error: 'Wątek nie znaleziony' });
    }
    res.status(200).json({ success: true, data: thread });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

