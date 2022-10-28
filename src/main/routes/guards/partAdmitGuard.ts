import {NextFunction, Request, Response} from 'express';
import {constructResponseUrlWithIdParams} from '../../common/utils/urlFormatter';
import {Claim} from '../../common/models/claim';
import {getCaseDataFromStore} from '../../modules/draft-store/draftStoreService';

export class partAdmitGuard {
  static apply(redirectUrl: string) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const caseData: Claim = await getCaseDataFromStore(req.session.claimId);
        const amount = caseData.partialAdmissionPaymentAmount();
        if (amount > 0) {
          return next();
        }

        res.redirect(constructResponseUrlWithIdParams(req.session.claimId, redirectUrl));
      } catch (error) {
        next(error);
      }
    };
  }
}
