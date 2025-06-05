import {NextFunction, RequestHandler, Response} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {MEDIATION_CLAIMANT_PHONE_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';

export const mediationPhoneRedirectionGuard = (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    if (claim.applicant1.partyPhone === undefined) {
      res.redirect(constructResponseUrlWithIdParams(claimId, MEDIATION_CLAIMANT_PHONE_URL));
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler;
