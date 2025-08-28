// backend/src/utils/s3Upload.js
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const loadS3Config = require('../config/s3Config');

let s3Config;
try {
  s3Config = loadS3Config();
} catch (error) {
  console.error('Failed to load S3 configuration:', error);
  process.exit(1);
}

const upload = multer({
  storage: multerS3({
    s3: s3Config.s3Client,
    bucket: s3Config.bucketName,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const timestamp = Date.now();
      const sanitizedName = file.originalname
        .replace(/\s+/g, '-')
        .normalize('NFKD')
        .replace(/[^\w\-\.]/g, '');
      const fileName = `${timestamp}-${sanitizedName}`;
      cb(null, fileName);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadSingle = async (file) => {
  if (!file) {
    throw new Error('Nie przesłano pliku');
  }

  let buffer, fileName, fileType;

  if (file.buffer && file.originalname && file.mimetype) {
    buffer = file.buffer;
    fileName = file.originalname
      .replace(/\s+/g, '-')
      .normalize('NFKD')
      .replace(/[^\w\-\.]/g, '');
    fileType = file.mimetype;
  } else if (file instanceof Blob || file instanceof File) {
    buffer = await file.arrayBuffer();
    fileName = file.name
      .replace(/\s+/g, '-')
      .normalize('NFKD')
      .replace(/[^\w\-\.]/g, '');
    fileType = file.type;
  } else if (typeof file === 'object' && file.originalname && file.location) {
    return {
      originalname: file.originalname,
      location: file.location,
    };
  } else {
    throw new Error('Nieprawidłowy format pliku');
  }

  const timestamp = Date.now();
  const key = `uploads/${timestamp}-${fileName}`;

  const params = {
    Bucket: s3Config.bucketName,
    Key: key,
    Body: buffer,
    ContentType: fileType,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Config.s3Client.send(command);

    // Generujemy podpisany URL od razu po uploadzie
    const signedUrl = await s3Config.getPublicUrl(key);

    return {
      originalname: fileName,
      location: signedUrl,
    };
  } catch (err) {
    console.error('Error uploading to S3:', err);
    throw err;
  }
};

module.exports = { upload, uploadSingle };
