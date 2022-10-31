import {NextFunction, Request, Response} from 'express';
import {Claim} from '../../common/models/claim';
import {getCaseDataFromStore} from '../../modules/draft-store/draftStoreService';
import {DASHBOARD_URL} from '../../routes/urls';

export class ResponseSubmitDateGuard {
  static apply() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const claim: Claim = await getCaseDataFromStore(req.session.claimId);
        return (claim.isResponseDatePastToday())
          ? next()
          : res.redirect(DASHBOARD_URL);
      } catch (error) {
        next(error);
      }
    };
  }
}
