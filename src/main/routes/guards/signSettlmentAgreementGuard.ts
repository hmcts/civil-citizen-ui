import {NextFunction, Request, Response} from 'express';
import {constructResponseUrlWithIdParams} from '../../common/utils/urlFormatter';
import {Claim} from '../../common/models/claim';
import {generateRedisKey, getCaseDataFromStore} from '../../modules/draft-store/draftStoreService';
import {AppRequest} from "models/AppRequest";

export class SignSettlmentAgreementGuard {
  static apply(redirectUrl: string) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const redisKey = generateRedisKey(req as unknown as AppRequest);
        const caseData: Claim = await getCaseDataFromStore(redisKey);
        if (caseData.hasDefendantCompletedPaymentIntention()) {
          return next();
        }
        res.redirect(constructResponseUrlWithIdParams(req.params.id, redirectUrl));
      } catch (error) {
        next(error);
      }
    };
  }
}
