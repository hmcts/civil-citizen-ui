import {NextFunction, Request, Response, RequestHandler} from 'express';
import {Claim} from 'common/models/claim';
import {getDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {BASE_ELIGIBILITY_URL} from 'routes/urls';
import {stashClaimOnRequest} from 'common/utils/claimRequestLocals';

export const claimIssueTaskListGuard = (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appReq: AppRequest = <AppRequest>req;
    const userId = appReq.session?.user?.id;

    let caseData : Claim;
    const draftResult = await getDraftClaim(appReq);
    if (draftResult) {
      appReq.session.draftId = draftResult.rawResponse.draftId;
      caseData = Object.assign(new Claim(), draftResult.claimResponse.case_data);
    } else {
      caseData = await getCaseDataFromStore(userId, true);
    }

    stashClaimOnRequest(req, caseData);
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
