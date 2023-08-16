import { Request, Response, NextFunction } from 'express';
import {Claim} from 'models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {DEFENDANT_SUMMARY_URL} from 'routes/urls';

export const trialArrangementsGuard = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const claimId = req.params.id;
    getClaimById(claimId, req)
      .then((caseData: Claim) => {
        if (caseData.isFastTrackClaim) {
          return next();
        }
        res.redirect(constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL));
      })
      .catch((error) => {
        next(error);
      });
  } catch (error) {
    next(error);
  }
};
