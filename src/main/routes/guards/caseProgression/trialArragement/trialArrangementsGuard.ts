import { Request, Response, NextFunction } from 'express';
import {Claim} from 'models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {DEFENDANT_SUMMARY_URL} from 'routes/urls';

export const trialArrangementsGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const caseData: Claim = await getClaimById(claimId, req);
    if (caseData.isFastTrackClaim) {
      return next();
    }
    res.redirect(constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL));
  } catch (error) {
    next(error);
  }

};
