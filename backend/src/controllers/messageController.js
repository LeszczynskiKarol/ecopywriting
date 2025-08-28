// backend/src/controllers/messageController.js
const Message = require('../models/Message');
const Thread = require('../models/Thread');
const Notification = require('../models/Notification');
const { generateEmailTemplate } = require('../utils/emailTemplate');
const sendEmail = require('../utils/sendEmail');

exports.sendMessage = async (req, res) => {
  try {
    const { threadId, content, recipientId } = req.body;
    const senderId = req.user.id;

    const thread = await Thread.findById(threadId).populate('participants', 'name email');
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Wątek nie znaleziony' });
    }

    const message = new Message({
      threadId,
      sender: senderId,
      recipient: recipientId,
      content
    });

    // Obsługa załączników
    if (req.files && req.files.length > 0) {
      message.attachments = req.files.map(file => ({
        filename: file.originalname,
        url: file.location
      }));
    }

    await message.save();

    thread.lastMessageDate = message.createdAt;
    await thread.save();

    // Tworzenie powiadomienia
    const notification = new Notification({
      user: recipientId,
      type: 'new_message',
      message: `Nowa wiadomość wątku ${thread.subject}`,
      thread: thread._id,
      subject: thread.subject,
      createdAt: new Date()
    });
    await notification.save();

    
    
    // Wysyłanie e-maila
    const emailContent = `
  <h2>Nowa wiadomość w wątku</h2>
  <p>Otrzymałeś nową wiadomość w wątku "${thread.subject}".</p>
  <p>Aby zobaczyć wiadomość, <a href="${process.env.FRONTEND_URL}/dashboard/messages/${thread._id}" class="button">zaloguj się do systemu</a> i przejdź do szczegółów wątku.</p>
`;

const emailData = {
  title: 'eCopywriting.pl',
  headerTitle: 'eCopywriting.pl',
  content: emailContent
};

const emailHtml = generateEmailTemplate(emailData);

try {
  await sendEmail({
    email: participant.email,
    subject: `eCopywriting.pl - Nowa wiadomość w wątku: ${thread.subject}`,
    message: emailHtml,
    isHtml: true
  });
} catch (emailError) {
  console.error('Błąd podczas wysyłania e-maila:', emailError);
}


    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { recipient: req.user.id }]
    }).sort('-createdAt').populate('sender', 'name').populate('recipient', 'name');

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'name')
      .populate('recipient', 'name');

    if (!message) {
      return res.status(404).json({ success: false, message: 'Wiadomość nie znaleziona' });
    }

    // Jeśli zalogowany użytkownik jest odbiorcą i wiadomość nie była jeszcze przeczytana
    if (message.recipient.toString() === req.user.id && !message.isRead) {
      message.isRead = true;
      await message.save();
    }

    res.status(200).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addAttachment = async (req, res) => {
  upload.single('file')(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const message = await Message.findById(req.params.id);
      if (!message) {
        return res.status(404).json({ success: false, message: 'Wiadomość nie znaleziona' });
      }

      if (message.sender.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Brak uprawnień' });
      }

      message.attachments.push({
        filename: req.file.originalname,
        url: req.file.location
      });

      await message.save();

      res.status(200).json({ success: true, data: message });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

exports.addMessageToThread = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const senderId = req.user.id;

    const thread = await Thread.findById(id).populate('participants', 'name email');
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Wątek nie znaleziony' });
    }

    const recipientId = thread.participants.find(p => p._id.toString() !== senderId.toString())?._id;
    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'Nie można określić odbiorcy' });
    }

    const newMessage = new Message({
      threadId: thread._id,
      sender: senderId,
      recipient: recipientId,
      content: content
    });


    if (req.files && req.files.length > 0) {
      newMessage.attachments = req.files.map(file => ({
        filename: file.originalname,
        url: file.location
      }));
    }

    await newMessage.save();

    thread.lastMessageDate = newMessage.createdAt;
    await thread.save();

    
    const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name');

    // Wysyłanie powiadomień do wszystkich uczestników wątku (oprócz nadawcy)
    for (const participant of thread.participants) {
      if (participant._id.toString() !== senderId.toString()) {
        // Tworzenie powiadomienia
        const notification = new Notification({
          user: participant._id,
          type: 'new_message',
          message: `Nowa wiadomość w wątku: ${thread.subject}`,
          thread: thread._id,
          subject: thread.subject,
          createdAt: new Date()
        });
        await notification.save();

                
        // Wysyłanie e-maila
        try {
          const emailSubject = `Nowa wiadomość w wątku: ${thread.subject}`;
          const emailMessage = `
            Otrzymałeś nową wiadomość w wątku "${thread.subject}".
            
            Aby zobaczyć wiadomość, zaloguj się do systemu i przejdź do szczegółów wątku:
            ${process.env.FRONTEND_URL}/dashboard/messages/${thread._id}
          `;

          await sendEmail({
            email: participant.email,
            subject: emailSubject,
            message: emailMessage
          });
        } catch (emailError) {
          console.error('Błąd podczas wysyłania e-maila:', emailError);
        }
      }
    }

    res.status(201).json({ 
      success: true, 
      data: populatedMessage
    });

  } catch (error) {
    console.error('Error in addMessageToThread:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};