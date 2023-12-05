import {NextFunction, Request, Response} from 'express';
import {constructResponseUrlWithIdParams} from '../../common/utils/urlFormatter';
import {Claim} from '../../common/models/claim';
import {generateRedisKey, getCaseDataFromStore} from '../../modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';

export class PartAdmitGuard {
  static apply(redirectUrl: string) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const caseData: Claim = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));
        const amount = caseData.partialAdmissionPaymentAmount();
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
