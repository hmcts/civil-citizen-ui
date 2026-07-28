import {NextFunction, Response} from 'express';
import {ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {getClaimById} from 'modules/utilityService';
import {getByIndexOrLast} from 'services/features/generalApplication/generalApplicationService';
import {queryParamNumber} from 'common/utils/requestUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import { GA_UPLOAD_N245_FORM_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {applicationTypeErrorUrl} from 'routes/guards/generalApplication/applicationTypeGuard';
import {getRouteParam} from 'common/utils/routeParamUtils';

export const claimApplicationCostGuard = async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const claim = await getClaimById(claimId, req, true);
    const applicationIndex = queryParamNumber(req, 'index');
    const applicationType = getByIndexOrLast(claim.generalApplication?.applicationTypes, applicationIndex)?.option;
    if (!applicationType) {
      res.redirect(applicationTypeErrorUrl(claimId));
    } else if (!claim.isClaimant() && applicationType === ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT) {
      res.redirect(constructResponseUrlWithIdParams(claimId, GA_UPLOAD_N245_FORM_URL));
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};
