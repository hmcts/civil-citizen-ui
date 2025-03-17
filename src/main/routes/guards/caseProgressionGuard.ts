import { NextFunction, Request, Response } from 'express';

export const isCaseProgressionV1Enabled = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  next();
};
