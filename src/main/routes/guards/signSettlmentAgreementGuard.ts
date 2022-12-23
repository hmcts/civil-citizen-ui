import {NextFunction, Request, Response} from 'express';
import {constructResponseUrlWithIdParams} from '../../common/utils/urlFormatter';
import {Claim} from '../../common/models/claim';
import {getCaseDataFromStore} from '../../modules/draft-store/draftStoreService';

export class SignSettlmentAgreementGuard {
  static apply(redirectUrl: string) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const caseData: Claim = await getCaseDataFromStore(req.params.id);
        if (caseData.isPartialAdmission() || caseData.isFullAdmission()) {
          if (caseData.partialAdmission?.paymentIntention?.repaymentPlan || caseData.fullAdmission?.paymentIntention?.repaymentPlan) {
            return next();
          }
        }
        res.redirect(constructResponseUrlWithIdParams(req.params.id, redirectUrl));
      } catch (error) {
        next(error);
      }
    };
  }
}
