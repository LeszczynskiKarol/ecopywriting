// backend/src/config/s3Config.js
const {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const loadS3Config = () => {
  const requiredEnvVars = [
    'AWS_BUCKET_NAME',
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  return {
    s3Client,
    bucketName: process.env.AWS_BUCKET_NAME,
    region: process.env.AWS_REGION,
    getPublicUrl: async (key) => {
      if (!key) return null;

      const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        ResponseContentDisposition: 'inline',
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600 * 24, // 24 godziny
      });

      return signedUrl;
    },
    deleteFile: async (key) => {
      if (!key) {
        console.log('Brak klucza do usunięcia');
        return;
      }
      try {
        const command = new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
        });

        await s3Client.send(command);
      } catch (error) {
        console.error('Błąd podczas usuwania pliku:', error);
        throw error;
      }
    },

    getKeyFromUrl: (url) => {
      if (!url) {
        console.log('Brak URL');
        return null;
      }
      try {
        const match = url.match(/amazonaws\.com\/[^/]+\/(.+?)(\?|$)/);

        const key = match ? match[1] : null;

        return key;
      } catch (error) {
        console.error('Błąd podczas wyciągania klucza z URL:', error);
        return null;
      }
    },
  };
};

let cachedConfig = null;

module.exports = () => {
  if (!cachedConfig) {
    cachedConfig = loadS3Config();
  }
  return cachedConfig;
};
