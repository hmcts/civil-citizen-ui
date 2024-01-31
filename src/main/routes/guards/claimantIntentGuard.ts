import { NextFunction, Request, Response } from 'express';
import { Claim } from '../../common/models/claim';
import { constructResponseUrlWithIdParams } from '../../common/utils/urlFormatter';
import { DASHBOARD_CLAIMANT_URL } from '../../routes/urls';
import { getClaimById } from 'modules/utilityService';
export const claimantIntentGuard = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  (async () => {
    try {
      const caseData: Claim = await getClaimById(req.params.id, req, true);
      if (caseData.isClaimantIntentionPending() || req.originalUrl.includes('claimant-response/confirmation')) {
        next();
      } else {
        res.redirect(
          constructResponseUrlWithIdParams(
            req.params.id,
            DASHBOARD_CLAIMANT_URL,
          ),
        );
      }
    } catch (error) {
      next(error);
    }
  })();
};
