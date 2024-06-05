import {NextFunction, Response} from 'express';
import {ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {getClaimById} from 'modules/utilityService';
import {getByIndexOrLast} from 'services/features/generalApplication/generalApplicationService';
import {queryParamNumber} from 'common/utils/requestUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GA_APPLICATION_COSTS_URL, ORDER_JUDGE_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';

export const agreementFromOtherPartyGuard = async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claim = await getClaimById(req.params.id, req, true);
    const applicationIndex = queryParamNumber(req, 'index');
    const applicationType = getByIndexOrLast(claim.generalApplication?.applicationTypes, applicationIndex)?.option;
    if (claim?.generalApplication?.applicationTypes?.length > 1) {
      return constructResponseUrlWithIdParams(req.params.id, ORDER_JUDGE_URL);
    } else if(applicationType === ApplicationTypeOption.SETTLE_BY_CONSENT) {
      res.redirect(constructResponseUrlWithIdParams(req.params.id, GA_APPLICATION_COSTS_URL));
    } else {
      next();
    }

  } catch (error) {
    next(error);
  }
};
