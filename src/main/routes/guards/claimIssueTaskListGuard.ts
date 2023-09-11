import {NextFunction, Request, Response} from 'express';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {BASE_ELIGIBILITY_URL} from 'routes/urls';

export const claimIssueTaskListGuard = (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    try {
      const appReq: AppRequest = <AppRequest>req;
      const userId = appReq.session?.user?.id;
      const caseData: Claim = await getCaseDataFromStore(userId);
      if (!caseData?.id && !req.cookies['eligibilityCompleted']){
        res.redirect(BASE_ELIGIBILITY_URL);
      }else{
        next();
      }
    } catch (error) {
      next(error);
    }
  })();
};
