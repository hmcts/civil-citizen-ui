import {NextFunction, Request, Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {getClaimById} from 'modules/utilityService';
import {getByIndexOrLast} from 'services/features/generalApplication/generalApplicationService';
import {queryParamNumber} from 'common/utils/requestUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GA_WANT_TO_UPLOAD_DOCUMENTS_URL} from 'routes/urls';

export const uploadN245FormControllerGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim = await getClaimById(req.params.id, <AppRequest>req, true);
    const applicationIndex = queryParamNumber(req, 'index');
    const applicationType = getByIndexOrLast(claim.generalApplication?.applicationTypes, applicationIndex)?.option;
    if (!claim.isClaimant() && applicationType === ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT) {
      next();
    } else {
      res.redirect(constructResponseUrlWithIdParams(req.params.id, GA_WANT_TO_UPLOAD_DOCUMENTS_URL));
    }
  } catch (error) {
    next(error);
  }
};
