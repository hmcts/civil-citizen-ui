import {NextFunction, Response} from 'express';
import {getClaimById} from 'modules/utilityService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {ORDER_JUDGE_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';

export const agreementFromOtherPartyGuard = async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claim = await getClaimById(req.params.id, req, true);
    if (claim?.generalApplication?.applicationTypes?.length > 1) {
      return res.redirect(constructResponseUrlWithIdParams(req.params.id, ORDER_JUDGE_URL));
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};
