import { NextFunction, Request, Response } from 'express';

export const isGAForLiPEnabled = (
  _req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next();
};
