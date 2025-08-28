// backend/src/controllers/adminOrderController.js
const Order = require('../models/Order');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { uploadSingle, upload } = require('../utils/s3Upload');
const { generateEmailTemplate } = require('../utils/emailTemplate');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const Notification = require('../models/Notification');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email');

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error('Błąd:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );
    if (!order) {
      return res
        .status(404)
        .json({ success: false, error: 'Zamówienie nie znalezione' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  console.log('====== DEBUG updateOrderStatus ======');
  console.log('1. Otrzymane dane:', {
    status: req.body.status,
    hasFiles: !!req.files,
    filesCount: req.files?.length,
    files: req.files?.map((f) => ({
      originalname: f.originalname,
      location: f.location,
      mimetype: f.mimetype,
    })),
  });

  try {
    const { status } = req.body;
    if (!status) {
      console.log('BŁĄD: Brak statusu');
      return res
        .status(400)
        .json({ success: false, error: 'Status nie może być pusty' });
    }

    const order = await Order.findById(req.params.id).populate('user', 'email');
    if (!order) {
      console.log('BŁĄD: Nie znaleziono zamówienia');
      return res
        .status(404)
        .json({ success: false, error: 'Zamówienie nie znalezione' });
    }

    order.status = status;
    order.lastUpdated = new Date();

    // ZMIANA: Usuwamy wywołanie uploadSingle i używamy bezpośrednio plików z req.files
    let newCompletedStatusFiles = [];
    if (status === 'zakończone' && req.files && req.files.length > 0) {
      console.log('3. Przetwarzanie plików...', req.files);

      // Bezpośrednio mapujemy pliki
      newCompletedStatusFiles = req.files.map((file) => ({
        filename: file.originalname,
        url: file.location, // multer-s3 już dodał location
        uploadDate: new Date(),
      }));

      console.log('4. Przetworzone pliki:', newCompletedStatusFiles);

      order.completedStatusFiles = [
        ...(order.completedStatusFiles || []),
        ...newCompletedStatusFiles,
      ];
    }

    await order.save();

    const orderUrl = `${process.env.FRONTEND_URL}/dashboard/orders/${order._id}`;
    // Tworzenie powiadomienia
    const notification = new Notification({
      user: order.user._id,
      order: order._id,
      type: 'order_status_change',
      message: `Status zamówienia nr ${order.orderNumber} został zmieniony na: ${status}`,
      newStatus: status,
      orderNumber: order.orderNumber,
      createdAt: new Date(),
      orderUrl: orderUrl,
    });
    await notification.save();

    if (order.user && order.user.email) {
      let emailContent = `
        <h2>Aktualizacja zamówienia</h2>
        <p>Status Twojego zamówienia #${order.orderNumber} został zmieniony na: <strong>${status}</strong></p>
      `;

      if (status === 'zakończone' && newCompletedStatusFiles.length > 0) {
        emailContent += `
          <p>Dodano nowe pliki do Twojego zamówienia. Możesz je pobrać klikając w poniższe linki:</p>
          <h3>Lista plików do pobrania:</h3>
          <ul>
        `;
        newCompletedStatusFiles.forEach((file) => {
          emailContent += `<li><a href="${file.url}">${file.filename}</a></li>`;
        });
        emailContent += '</ul>';
      }

      emailContent += `
        <p>Możesz przejrzeć szczegóły zamówienia <a href="${orderUrl}" class="button">klikając tutaj</a>.</p>
      `;

      const emailData = {
        title: 'eCopywriting.pl',
        headerTitle: 'eCopywriting.pl',
        content: emailContent,
      };

      const emailHtml = generateEmailTemplate(emailData);

      await sendEmail({
        email: order.user.email,
        subject: 'eCopywriting.pl - aktualizacja statusu zamówienia',
        message: emailHtml,
        isHtml: true,
      });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error('Błąd podczas aktualizacji statusu zamówienia:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.attachFileToOrder = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: 'Nie przesłano pliku' });
    }

    const { fileType } = req.body;
    const allowedTypes = ['pdf', 'docx', 'image', 'other'];
    if (!allowedTypes.includes(fileType)) {
      return res
        .status(400)
        .json({ success: false, error: 'Nieprawidłowy typ pliku' });
    }

    const order = await Order.findById(req.params.id).populate('user');
    if (!order) {
      return res
        .status(404)
        .json({ success: false, error: 'Zamówienie nie znalezione' });
    }

    const fileInfo = {
      filename: req.file.originalname,
      url: req.file.location,
      uploadDate: new Date(),
    };

    if (fileType === 'other') {
      if (!order.attachments.other) {
        order.attachments.other = [];
      }
      order.attachments.other.push(fileInfo);
    } else {
      order.attachments[fileType] = fileInfo;
    }

    await order.save();

    const notification = new Notification({
      user: order.user._id,
      order: order._id,
      type: 'file_added',
      message: `Dodano plik do zamówienia nr ${order.orderNumber}.`,
      file: {
        filename: fileInfo.filename,
        url: fileInfo.url,
      },
    });
    await notification.save();

    if (order.user && order.user.email) {
      const emailContent = `
        <h2>Nowy plik dodany do zamówienia</h2>
        <p>Dodano nowy plik do Twojego zamówienia nr ${order.orderNumber}.</p>
        <p>Zaloguj się do <a href="${process.env.FRONTEND_URL}/dashboard/orders/${order._id}" class="button">panelu klienta</a>, aby zobaczyć szczegóły.</p>
      `;

      const emailData = {
        title: 'eCopywriting.pl',
        headerTitle: 'eCopywriting.pl',
        content: emailContent,
      };

      const emailHtml = generateEmailTemplate(emailData);

      try {
        await sendEmail({
          email: order.user.email,
          subject: 'eCopywriting.pl - nowy plik dodany do zamówienia',
          message: emailHtml,
          isHtml: true,
        });
        console.log('E-mail wysłany do użytkownika');
      } catch (emailError) {
        console.error(
          'Błąd podczas wysyłania e-maila do użytkownika:',
          emailError
        );
      }
    } else {
      console.error('Nie można wysłać e-maila: brak adresu e-mail użytkownika');
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error('Błąd podczas dodawania pliku:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getOrderAttachments = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'email');
    if (!order) {
      return res
        .status(404)
        .json({ success: false, error: 'Zamówienie nie znalezione' });
    }
    res.status(200).json({ success: true, data: order.attachments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteAttachment = async (req, res) => {
  try {
    const { id, fileType, fileIndex } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, error: 'Zamówienie nie znalezione' });
    }

    let fileToDelete;
    if (fileType === 'other') {
      if (
        !order.attachments.other ||
        order.attachments.other.length <= fileIndex
      ) {
        return res
          .status(404)
          .json({ success: false, error: 'Załącznik nie znaleziony' });
      }
      fileToDelete = order.attachments.other[fileIndex];
      order.attachments.other.splice(fileIndex, 1);
    } else {
      if (!order.attachments[fileType]) {
        return res
          .status(404)
          .json({ success: false, error: 'Załącznik nie znaleziony' });
      }
      fileToDelete = order.attachments[fileType];
      order.attachments[fileType] = undefined;
    }

    // Usuń plik z S3
    if (fileToDelete && fileToDelete.url) {
      const key = new URL(fileToDelete.url).pathname.slice(1); // Usuń początkowy '/'
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(deleteCommand);
    }

    await order.save();
    res.status(200).json({
      success: true,
      message: 'Plik został usunięty',
      data: order.attachments,
    });
  } catch (error) {
    console.error('Błąd podczas usuwania pliku:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addAdminNote = async (req, res) => {
  try {
    const { note } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $push: { adminNotes: { note, createdAt: Date.now() } } },
      { new: true, runValidators: true }
    );
    if (!order) {
      return res
        .status(404)
        .json({ success: false, error: 'Zamówienie nie znalezione' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
