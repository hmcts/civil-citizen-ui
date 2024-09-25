import { AppRequest } from 'common/models/AppRequest';
import { NextFunction, Response } from 'express';
import { deleteGAFromClaimsByUserId } from 'services/features/generalApplication/generalApplicationService';

export const deleteGAGuard = async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    await deleteGAFromClaimsByUserId(req.session?.user?.id);
    next();
  } catch (error) {
    next(error);
  }
};
