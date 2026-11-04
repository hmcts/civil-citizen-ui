import {NextFunction, Request, Response} from 'express';
import {constructResponseUrlWithIdParams} from '../../common/utils/urlFormatter';
import {Claim} from '../../common/models/claim';
import {getResponseClaimById} from '../../modules/draft-store/response/responseDraftStoreService';
import {YesNo} from '../../common/form/models/yesNo';
import {AppRequest} from 'common/models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

export class PartAdmitHowMuchHaveYouPaidGuard {
  static apply(redirectUrl: string) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const caseId = getRouteParam(req, 'id');
        const claim: Claim = await getResponseClaimById(<AppRequest>req, caseId);
        if (claim.isPartialAdmission() &&
          (claim.partialAdmission.alreadyPaid.option === YesNo.YES || claim.partialAdmission.alreadyPaid.option === YesNo.NO)) {
          return next();
        }
        res.redirect(constructResponseUrlWithIdParams(req.params.id, redirectUrl));
      } catch (error) {
        next(error);
      }
    };
  }
}
