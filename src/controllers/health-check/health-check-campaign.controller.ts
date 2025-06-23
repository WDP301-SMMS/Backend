import { Request, Response } from 'express';

const createHealthCheckCampaign = async (req: Request, res: Response) => {
  try {
  } catch (error) {
    console.error('Error in createHealthCheckCampaign:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
