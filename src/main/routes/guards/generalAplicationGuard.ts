import { NextFunction, Request, Response } from 'express';

export const isGAForLiPEnabled = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  next();
};
