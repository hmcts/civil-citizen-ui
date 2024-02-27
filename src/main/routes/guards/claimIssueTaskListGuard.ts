import {NextFunction, Request, Response, RequestHandler} from 'express';
import {Claim} from 'common/models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {BASE_ELIGIBILITY_URL} from 'routes/urls';

export const claimIssueTaskListGuard = (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appReq: AppRequest = <AppRequest>req;
    const userId = appReq.session?.user?.id;
    const caseData: Claim = await getCaseDataFromStore(userId, true);
    const excludeUrlList = ['/confirmation', '/fee', '/fee-change', '/pay-fees'].some(endpoint => req.originalUrl.includes(endpoint));
    if (!caseData?.isDraftClaim()
      && !req.cookies['eligibilityCompleted']
      && !excludeUrlList) {
      res.redirect(BASE_ELIGIBILITY_URL);
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler;
