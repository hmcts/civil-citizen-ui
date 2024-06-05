import {NextFunction, Request, Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {getClaimById} from 'modules/utilityService';
import {getByIndexOrLast} from 'services/features/generalApplication/generalApplicationService';
import {queryParamNumber} from 'common/utils/requestUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GA_WANT_TO_UPLOAD_DOCUMENTS} from 'routes/urls';

const options = [ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT, ApplicationTypeOption.SET_ASIDE_JUDGEMENT, ApplicationTypeOption.SETTLE_BY_CONSENT];
export const addAnotherApplicationGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim = await getClaimById(req.params.id, <AppRequest>req, true);
    const applicationIndex = queryParamNumber(req, 'index');
    const applicationType = getByIndexOrLast(claim.generalApplication?.applicationTypes, applicationIndex)?.option;
    if (options.indexOf(applicationType) !== -1) {
      return constructResponseUrlWithIdParams(req.params.id, GA_WANT_TO_UPLOAD_DOCUMENTS);
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};
