import { AppRequest } from 'common/models/AppRequest';
import { NextFunction, RequestHandler, Response, Router } from 'express';
import { TESTING_SUPPORT_URL } from 'routes/urls';
//CLAIM_CHECK_ANSWERS_URL
import { saveDraftClaimToCache } from 'modules/draft-store/draftClaimCache';
const createDraftViewPath = 'features/claim/create-draft';
import jwt_decode from 'jwt-decode';

interface IdTokenJwtPayload {
  uid: string;
  sub: string;
  given_name: string;
  family_name: string;
  roles: string[];
}
const createDraftClaimController = Router();
createDraftClaimController.get(TESTING_SUPPORT_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    return res.render(createDraftViewPath, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

createDraftClaimController.post(TESTING_SUPPORT_URL, (async (req, res: Response, next: NextFunction) => {
  try {
    const jwt: IdTokenJwtPayload = jwt_decode(req.body?.idToken);
    const caseData = req.body?.caseData ? JSON.parse(req.body?.caseData) : undefined;
    await saveDraftClaimToCache(jwt.uid, caseData);
    // return res.redirect(CLAIM_CHECK_ANSWERS_URL);
    return res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default createDraftClaimController;