// backend/src/controllers/subscriberController.js
const Subscriber = require('../models/Subscriber');

exports.addSubscriber = async (req, res) => {
  try {
    const { email, name, tags, source } = req.body;
    const subscriber = await Subscriber.create({ 
      email, 
      name, 
      tags, 
      source,
      preferences: {
        categories: ['Nowości', 'Promocje', 'Porady', 'Branżowe', 'Technologia']
      }
    });
    res.status(201).json({ success: true, data: subscriber });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.removeSubscriber = async (req, res) => {
  try {
    const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
    if (!subscriber) {
      return res.status(404).json({ success: false, error: 'Subskrybent nie znaleziony' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateSubscriber = async (req, res) => {
  try {
    const subscriber = await Subscriber.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!subscriber) {
      return res.status(404).json({ success: false, error: 'Subskrybent nie znaleziony' });
    }
    res.status(200).json({ success: true, data: subscriber });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getSubscribers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Subscriber.countDocuments();

    const subscribers = await Subscriber.find()
      .populate('user', 'name email')
      .skip(startIndex)
      .limit(limit)
      .sort({ subscriptionDate: -1 });

    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: subscribers.length,
      pagination,
      data: subscribers
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.searchSubscribers = async (req, res) => {
  try {
    const { query } = req.query;
    const subscribers = await Subscriber.find({
      $or: [
        { email: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    });
    res.status(200).json({ success: true, count: subscribers.length, data: subscribers });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getPreferences = async (req, res) => {
  try {
    const subscriber = await Subscriber.findOne({ user: req.user.id });
    if (!subscriber) {
      return res.status(404).json({ success: false, error: 'Subskrybent nie znaleziony' });
    }
    res.status(200).json({
      success: true,
      isSubscribed: subscriber.isActive,
      preferences: subscriber.preferences
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


  
  exports.updatePreferences = async (req, res) => {
    try {
      const subscriber = await Subscriber.findOneAndUpdate(
        { user: req.user.id },
        { preferences: req.body.preferences },
        { new: true, runValidators: true }
      );
      if (!subscriber) {
        return res.status(404).json({ success: false, error: 'Subskrybent nie znaleziony' });
      }
      res.status(200).json({ success: true, data: subscriber });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  };
  

  exports.toggleSubscription = async (req, res) => {
    try {
      const { isSubscribed } = req.body;
      const subscriber = await Subscriber.findOneAndUpdate(
        { user: req.user.id },
        { isActive: isSubscribed },
        { new: true, runValidators: true }
      );
      if (!subscriber) {
        return res.status(404).json({ success: false, error: 'Subskrybent nie znaleziony' });
      }
      res.status(200).json({ success: true, data: subscriber });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  };
  

  exports.checkSubscriptionStatus = async (req, res) => {
    try {
      const subscriber = await Subscriber.findOne({ user: req.user.id });
      res.status(200).json({
        success: true,
        isSubscribed: subscriber ? subscriber.isActive : false
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  