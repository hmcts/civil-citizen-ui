import {NextFunction, Response} from 'express';
import {ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {getClaimById} from 'modules/utilityService';
import {getByIndexOrLast} from 'services/features/generalApplication/generalApplicationService';
import {queryParamNumber} from 'common/utils/requestUtils';
import {constructResponseUrlWithIdParams, constructUrlWithIndex} from 'common/utils/urlFormatter';
import {GA_APPLICATION_COSTS_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {YesNo} from 'form/models/yesNo';

const options = [ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT, ApplicationTypeOption.SET_ASIDE_JUDGEMENT, ApplicationTypeOption.SETTLE_BY_CONSENT];

export const informOtherPartiesGuard = async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claim = await getClaimById(req.params.id, req, true);
    const applicationIndex = queryParamNumber(req, 'index');
    const applicationType = getByIndexOrLast(claim.generalApplication?.applicationTypes, applicationIndex)?.option;
    if (options.indexOf(applicationType) !== -1  || claim?.generalApplication?.agreementFromOtherParty === YesNo.YES) {
      res.redirect(constructUrlWithIndex(constructResponseUrlWithIdParams(req.params.id, GA_APPLICATION_COSTS_URL), applicationIndex));
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};
