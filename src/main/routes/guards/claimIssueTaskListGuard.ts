import {NextFunction, Request, RequestHandler, Response} from 'express';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {BASE_ELIGIBILITY_URL} from 'routes/urls';
import {Claim} from 'common/models/claim';

export const claimIssueTaskListGuard = (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appReq: AppRequest = <AppRequest>req;
    const userId = appReq.session?.user?.id;
    const caseData: Claim = await getCaseDataFromStore(userId);
    if (!caseData?.isDraftClaim() && !req.cookies['eligibilityCompleted']) {
      res.redirect(BASE_ELIGIBILITY_URL);
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler;
