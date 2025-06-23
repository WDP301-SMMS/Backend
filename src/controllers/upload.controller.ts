import { Request, Response } from 'express';
import { uploadToFirebase } from '../services/upload.service';

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).send('No file uploaded');
      return;
    }

    const url = await uploadToFirebase(req.file);
    res.json({ url }); // ✅ chỉ gửi response, không return
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

