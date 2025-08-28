// src/controllers/adminThreadController.js

const Thread = require('../models/Thread');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');
const { generateEmailTemplate } = require('../utils/emailTemplate');



exports.getThreadById = async (req, res) => {

  try {

    const thread = await Thread.findById(req.params.id);

    if (!thread) {

      return res.status(404).json({ success: false, message: 'Thread not found' });

    }



    const messages = await Message.find({ threadId: thread._id })

      .sort('createdAt')

      .populate('sender', 'name')

      .populate('recipient', 'name');



    res.status(200).json({ success: true, data: { thread, messages } });

  } catch (error) {

    res.status(500).json({ success: false, message: error.message });

  }

};




exports.addMessage = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    console.log('Thread ID:', req.params.id);
    console.log('Sender ID:', req.user.id);
    
    const { content } = req.body;
    const threadId = req.params.id;
    const senderId = req.user.id;

    const thread = await Thread.findById(threadId).populate('participants', 'name email role');
    if (!thread) {
      console.log('Thread not found');
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }
    console.log('Thread:', thread);

    // Find the recipient (the user who is not the sender)
    const recipient = thread.participants.find(p => p._id.toString() !== senderId.toString());
    console.log('Recipient:', recipient);

    if (!recipient) {
      console.log('Cannot determine message recipient');
      return res.status(400).json({ success: false, message: 'Cannot determine message recipient' });
    }

    // Generate appropriate URL based on recipient's role
    const threadUrl = recipient.role === 'admin' 
      ? `${process.env.FRONTEND_URL}/admin/threads/${thread._id}`
      : `${process.env.FRONTEND_URL}/dashboard/messages/${thread._id}`;

    const message = new Message({
      threadId,
      sender: senderId,
      recipient: recipient._id,
      content,
      attachments: []
    });

    console.log('New message:', message);
      
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          console.log('Processing file:', file);
          message.attachments.push({
            filename: file.originalname,
            url: file.location
          });
        } catch (error) {
          console.error('Error processing file:', error);
        }
      }
    }

    await message.save();

    thread.lastMessageDate = message.createdAt;
    await thread.save();

    // Fetch the saved message with populated sender and recipient fields
    const savedMessage = await Message.findById(message._id)
      .populate('sender', 'name role')
      .populate('recipient', 'name role');

    const notification = new Notification({
      user: recipient._id,
      type: 'new_message',
      message: `Nowa wiadomość w wątku [${thread.subject}](${threadUrl})`,
      thread: thread._id,
      subject: thread.subject,
      threadUrl: threadUrl
    });
    await notification.save();

    console.log('Created notification:', notification);

    sendNotification(recipient._id.toString(), {
      type: 'new_message',
      threadId: thread._id,
      subject: thread.subject,
      message: `Nowa wiadomość w wątku [${thread.subject}](${threadUrl})`,
      threadUrl: threadUrl,
      createdAt: new Date().toISOString()
    });

    // Prepare email content
    const emailContent = `
      <h2>Nowa wiadomość w wątku</h2>
      <p>Pojawiła się nowa wiadomość w wątku "${thread.subject}".</p>
      <div class="card">
        <p class="card-title">Treść wiadomości:</p>
        <p>${content}</p>
      </div>
      <p>Kliknij <a href="${threadUrl}" class="button">tutaj</a>, aby zobaczyć szczegóły wątku.</p>
    `;

    const emailData = {
      title: 'eCopywriting.pl',
      headerTitle: 'eCopywriting.pl',
      content: emailContent
    };

    const emailHtml = generateEmailTemplate(emailData);

    // Send email notification
    try {
      await sendEmail({
        email: recipient.email,
        subject: `eCopywriting.pl - nowa wiadomość w wątku ${thread.subject}`,
        message: emailHtml,
        isHtml: true
      });
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue execution even if there's an error sending the email
    }

    res.status(201).json({ success: true, data: savedMessage });
  } catch (error) {
    console.error('Error in addMessage:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleThreadStatus = async (req, res) => {
  try {
    console.log('Toggling thread status for thread ID:', req.params.id);
    
    const thread = await Thread.findById(req.params.id).populate('participants', 'name email role');
    if (!thread) {
      console.log('Thread not found');
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    console.log('Thread found:', thread);

    thread.isOpen = !thread.isOpen;
    await thread.save();

    console.log('Thread status updated:', thread.isOpen);

    // Znajdź odbiorcę, który nie jest aktualnym użytkownikiem
    const recipient = thread.participants.find(p => p._id.toString() !== req.user.id.toString());
    console.log('Recipient:', recipient);

    if (!recipient) {
      console.log('Recipient not found');
      return res.status(400).json({ success: false, message: 'Recipient not found' });
    }

    // Generujemy odpowiedni URL w zależności od roli odbiorcy
    const threadUrl = recipient.role === 'admin' 
      ? `${process.env.FRONTEND_URL}/admin/threads/${thread._id}`
      : `${process.env.FRONTEND_URL}/dashboard/messages/${thread._id}`;

      const notification = new Notification({
        user: recipient._id,
        type: 'thread_status_change',
        message: `Wątek "[${thread.subject}](${threadUrl}) został ${thread.isOpen ? 'otwarty' : 'zamknięty'}.`,
        thread: thread._id,
        subject: thread.subject,
        isOpen: thread.isOpen,
        threadUrl: threadUrl
      });
      await notification.save();

    console.log('Created notification:', notification);

    

    // Wysyłanie maila
    const emailContent = `
      <h2>Status wątku zmieniony</h2>
      <p>Status wątku "${thread.subject}" (ID: ${thread._id}) został zmieniony na <strong>${thread.isOpen ? 'otwarty' : 'zamknięty'}</strong>.</p>
      <p>Kliknij <a href="${threadUrl}" class="button">tutaj</a>, aby zobaczyć szczegóły wątku.</p>
    `;

    const emailData = {
      title: 'eCopywriting.pl',
      headerTitle: 'eCopywriting.pl',
      content: emailContent
    };

    const emailHtml = generateEmailTemplate(emailData);

    try {
      await sendEmail({
        email: recipient.email,
        subject: `eCopywriting.pl - status wątku zmieniony: ${thread.subject}`,
        message: emailHtml,
        isHtml: true
      });
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Kontynuujemy wykonywanie funkcji, nawet jeśli wystąpił błąd z wysyłaniem emaila
    }

    res.status(200).json({ success: true, data: thread });
  } catch (error) {
    console.error('Error in toggleThreadStatus:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};