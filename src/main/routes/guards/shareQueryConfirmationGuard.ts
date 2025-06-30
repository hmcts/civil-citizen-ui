import { Response, NextFunction } from 'express';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';
import {QM_SHARE_QUERY_CONFIRMATION} from 'routes/urls';
import { AppRequest } from 'models/AppRequest';

export const shareQueryConfirmationGuard = (req: AppRequest, res: Response, next: NextFunction): void => {
  try {
    const claimId = req.params.id;

    if (!req.session?.qmShareConfirmed) {
      res.redirect(constructResponseUrlWithIdParams(claimId, QM_SHARE_QUERY_CONFIRMATION));
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};

export const clearShareQuerySessionIfLeftJourney = (req: AppRequest, res: Response, next: NextFunction): void => {
  const allowedJourneyPaths = ['/share-query', '/create-query', '/create-query-cya', '/back'];
  const pathOnly = req.originalUrl.split('?')[0];
  const isInJourney = allowedJourneyPaths.some(path => pathOnly.includes(path));

  if (!isInJourney && req.session?.qmShareConfirmed) {
    delete req.session.qmShareConfirmed;
  }
  next();
};
