import {NextFunction, Request, Response} from 'express';
import {constructResponseUrlWithIdParams} from '../../common/utils/urlFormatter';
import {getResponseClaimById} from '../../modules/draft-store/response/responseDraftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

export class PartAdmitGuard {
  static apply(redirectUrl: string) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const caseId = getRouteParam(req, 'id');
        const claim = await getResponseClaimById(<AppRequest>req, caseId);
        const amount = claim.partialAdmissionPaymentAmount();
        if (amount > 0) {
          return next();
        }

        res.redirect(constructResponseUrlWithIdParams(req.params.id, redirectUrl));
      } catch (error) {
        next(error);
      }
    };
  }
}
