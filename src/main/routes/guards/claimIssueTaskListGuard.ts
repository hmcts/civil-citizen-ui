import {NextFunction, Response} from 'express';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';

export class ClaimIssueTaskListGuard {
  static apply(redirectUrl: string) {
    return async (req: AppRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        const userId = req.session?.user?.id;
        const caseData: Claim = await getCaseDataFromStore(userId);
        if (!caseData.id && !req.cookies['eligibilityCompletedV2']){
          res.redirect(redirectUrl);
        }
        return next();
      } catch (error) {
        next(error);
      }
    };
  }
}
