import {Claim} from 'common/models/claim';
import {getDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {AppRequest} from 'models/AppRequest';
import {BASE_ELIGIBILITY_URL} from 'routes/urls';
import {stashClaimOnRequest} from 'common/utils/claimRequestLocals';

export const claimIssueTaskListGuard = (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const appReq: AppRequest = <AppRequest>req;

    let caseData: CLaim = new CLaim();
    const draftResult = await getDraftClaim(appReq);

    if (draftResult) {
      appReq.session.draftId = draftResult.rawResponse.draftId;
      caseData = Object.assign(new Claim(), draftResult.claimResponse.case_data);

      if (!caseData.draftClaimCreatedAt && draftResult.createdAt) {
        caseData.draftClaimCreatedAt = new Date(draftResult.createdAt);
      }
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
