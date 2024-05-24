import {NextFunction, Request, Response} from 'express';
import {AppRequest} from '../../common/models/AppRequest';
import {ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {getClaimById} from 'modules/utilityService';
import {getByIndexOrLast} from 'services/features/generalApplication/generalApplicationService';
import { queryParamNumber } from 'common/utils/requestUtils';

export const orderJudgeGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim = await getClaimById(req.params.id, <AppRequest>req, true);
    const applicationIndex = queryParamNumber(req, 'index');
    const applicationType = getByIndexOrLast(claim.generalApplication?.applicationTypes, applicationIndex)?.option;
    if (applicationType === ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT && !claim.isClaimant()) {
      res.redirect('test'); // TODO: redirect
    } else {
      next();
    }

  } catch (error) {
    next(error);
  }
};
