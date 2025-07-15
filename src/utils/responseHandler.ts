import { Response } from 'express';

export const handleSuccessResponse = (
  res: Response,
  status: number,
  message: string,
  data?: any,
) => {
  res.status(status).json({
    success: true,
    message,
    data,
  });
};
