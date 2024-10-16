import {NextFunction, Request, Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {getClaimById} from 'modules/utilityService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GA_ADD_ANOTHER_APPLICATION_URL} from 'routes/urls';

const options = [ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT];
export const orderJudgeGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim = await getClaimById(req.params.id, <AppRequest>req, true);
    const isOrderJudgeNotAllowed = options.some(value => claim.generalApplication?.applicationTypes.some(obj => obj.option === value));
    if (isOrderJudgeNotAllowed) {
      res.redirect(constructResponseUrlWithIdParams(req.params.id, GA_ADD_ANOTHER_APPLICATION_URL));
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};
