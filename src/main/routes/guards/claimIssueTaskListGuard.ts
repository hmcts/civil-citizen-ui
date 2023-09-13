import {NextFunction, Request, RequestHandler, Response} from 'express';
import {getDraftClaimFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {BASE_ELIGIBILITY_URL} from 'routes/urls';

export const claimIssueTaskListGuard = (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appReq: AppRequest = <AppRequest>req;
    const userId = appReq.session?.user?.id;
    const draftClaim = await getDraftClaimFromStore(userId);
    if (!draftClaim?.case_data && !req.cookies['eligibilityCompleted']) {
      res.redirect(BASE_ELIGIBILITY_URL);
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler;
