import {NextFunction, Request, Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {getClaimById} from 'modules/utilityService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GA_WANT_TO_UPLOAD_DOCUMENTS_URL} from 'routes/urls';

const options = [ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT, ApplicationTypeOption.SET_ASIDE_JUDGEMENT, ApplicationTypeOption.SETTLE_BY_CONSENT];
export const requestingReasonControllerGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim = await getClaimById(req.params.id, <AppRequest>req, true);
    const isRequestReasonAllowed = options.some(value => claim.generalApplication?.applicationTypes.some(obj => obj.option === value));
    if (isRequestReasonAllowed) {
      next();
    } else {
      res.redirect(constructResponseUrlWithIdParams(req.params.id, GA_WANT_TO_UPLOAD_DOCUMENTS_URL));
    }
  } catch (error) {
    next(error);
  }
};
