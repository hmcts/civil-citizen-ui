import { Request, Response, NextFunction } from 'express';


export const trialArrangementsGuard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    next();
  } catch (error) {
    next(error);
  }
};

