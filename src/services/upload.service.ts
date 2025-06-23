import { bucket } from '../config/firebase';

export const uploadToFirebase = async (file: Express.Multer.File) => {
  const blob = bucket.file(Date.now() + '-' + file.originalname);

  const stream = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise<string>((resolve, reject) => {
    stream.on('error', reject);
    stream.on('finish', async () => {
      const [url] = await blob.getSignedUrl({
        action: 'read',
        expires: '03-09-2030',
      });
      resolve(url);
    });
    stream.end(file.buffer);
  });
};
