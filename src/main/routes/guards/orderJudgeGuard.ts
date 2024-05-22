import {NextFunction, Request, Response} from 'express';
import {AppRequest} from '../../common/models/AppRequest';
import {ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {getClaimById} from 'modules/utilityService';

export const orderJudgeGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim = await getClaimById(req.params.id, <AppRequest>req, true);
    const applicationType = claim.generalApplication?.applicationTypes[claim.generalApplication.applicationTypes.length - 1]?.option;
    if (applicationType === ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT && !claim.isClaimant()) {
      res.redirect('test'); // TODO: redirect
    } else {
      next();
    }

  } catch (error) {
    next(error);
  }
};
