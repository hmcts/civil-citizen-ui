import {NextFunction, Request, Response} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {DASHBOARD_CLAIMANT_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';

export const ccjConfirmationGuard = (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    try {
      const claim = await getClaimById(req.params.id, <AppRequest>req, true);
      if (claim.isCCJComplete()) {
        next();
      } else {
        res.redirect(constructResponseUrlWithIdParams(req.params.id, DASHBOARD_CLAIMANT_URL));
      }
    } catch (error) {
      next(error);
    }
  })();
};
