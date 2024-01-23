import { AppRequest } from 'common/models/AppRequest';
import { NextFunction, RequestHandler, Response, Router } from 'express';
import { CLAIM_CHECK_ANSWERS_URL, TESTING_SUPPORT_URL } from 'routes/urls';
import {saveDraftClaimToCache} from 'modules/draft-store/draftClaimCache';
const checkAnswersViewPath = 'features/claim/create-draft';


const createDraftClaimController = Router();
createDraftClaimController.get(TESTING_SUPPORT_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    return res.render(checkAnswersViewPath, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

createDraftClaimController.post(TESTING_SUPPORT_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.user?.id;
    await saveDraftClaimToCache(userId);
    return res.redirect(CLAIM_CHECK_ANSWERS_URL);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default createDraftClaimController;
