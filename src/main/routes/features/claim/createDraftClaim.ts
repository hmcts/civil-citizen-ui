import { AppRequest, AppSession } from 'common/models/AppRequest';
import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import { CLAIM_CHECK_ANSWERS_URL, TESTING_SUPPORT_URL } from 'routes/urls';
import {createOrLoadDraft} from 'modules/draft-store/draftStoreManagerService';
const createDraftViewPath = 'features/claim/create-draft';
import jwt_decode from 'jwt-decode';
import {isCarmEnabledForCase} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'models/claim';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

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

createDraftClaimController.post(TESTING_SUPPORT_URL, (async (req: Request, res: Response, next: NextFunction) => {
  const claimWithSubmittedDate = {
    submittedDate : new Date().toISOString(),
  };
  try {
    const appReq = req as AppRequest;
    let userId = ((req.session) as AppSession)?.user?.id;
    const caseData = req.body?.caseData ? JSON.parse(req.body?.caseData) : undefined;

    if (req.body?.idToken) {
      const jwt: IdTokenJwtPayload = jwt_decode(req.body?.idToken);
      userId = jwt?.uid;
      if (appReq.session?.user) {
        appReq.session.user.id = userId;
      }
    }

    if(!req.cookies['eligibilityCompleted']){
      const MILLISECONDS_IN_1_HOUR = 3600000;
      res.cookie('eligibilityCompleted', true, {maxAge: MILLISECONDS_IN_1_HOUR, httpOnly: true });
    }

    const claimData = Object.assign(new Claim(), caseData || {}, claimWithSubmittedDate);
    const draftResult = await createOrLoadDraft(appReq, claimData);

    if(appReq.session) {
      appReq.session.draftId = draftResult.rawResponse.draftId;
    }

    if (!caseData?.isDraftClaim()) {
      await civilServiceClient.createDashboard(appReq);
    }

    await isCarmEnabledForCase(claimData.submittedDate);

    if (req.body?.idToken && userId) {
      return res.sendStatus(200);
    }
    return res.redirect(CLAIM_CHECK_ANSWERS_URL);

  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default createDraftClaimController;
