import {NextFunction, RequestHandler, Response} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {MEDIATION_CLAIMANT_PHONE_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

export const mediationClaimantPhoneRedirectionGuard = (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));
    if (req.method ==='GET' && claim.applicant1.partyPhone === undefined && claim.isClaimant()) {
      res.redirect(constructResponseUrlWithIdParams(claimId, MEDIATION_CLAIMANT_PHONE_URL));
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler;
