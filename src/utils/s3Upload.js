// src/utils/s3Upload.js
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');

if (!process.env.AWS_BUCKET_NAME) {
  throw new Error('AWS_BUCKET_NAME is not defined in environment variables');
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 } // limit to 10MB
});

const uploadSingle = async (file) => {
  if (!file) {
    throw new Error('Nie przesłano pliku');
  }

  console.log('Received file:', file);

  let buffer, fileName, fileType;

  if (file.buffer && file.originalname && file.mimetype) {
    // File from multer
    buffer = file.buffer;
    fileName = file.originalname;
    fileType = file.mimetype;
  } else if (file instanceof Blob || file instanceof File) {
    // Standard File or Blob object
    buffer = await file.arrayBuffer();
    fileName = file.name;
    fileType = file.type;
  } else if (typeof file === 'object' && file.originalname && file.location) {
    // File already uploaded by multer-s3
    return {
      originalname: file.originalname,
      location: file.location,
    };
  } else {
    console.error('Nieprawidłowy format pliku:', file);
    throw new Error('Nieprawidłowy format pliku');
  }

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `orders/${Date.now()}-${fileName}`,
    Body: buffer,
    ContentType: fileType,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return {
      originalname: fileName,
      location: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`,
    };
  } catch (err) {
    console.error('Error uploading to S3:', err);
    throw err;
  }
};

module.exports = { upload, uploadSingle };