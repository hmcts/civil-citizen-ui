import { AppRequest, AppSession } from 'common/models/AppRequest';
import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import { CLAIMANT_TASK_LIST_URL, TESTING_SUPPORT_URL } from 'routes/urls';
import {createOrLoadDraft, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {cloneDefaultDraftClaimCaseData, saveDraftClaimToCache} from 'modules/draft-store/draftClaimCache';
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
  const submittedDate = new Date();
  const claimWithSubmittedDate = {
    submittedDate : submittedDate.toISOString(),
  };
  try {
    const appReq = req as AppRequest;
    let userId = ((req.session) as AppSession)?.user?.id;
    const rawCaseData = req.body?.caseData ? JSON.parse(req.body?.caseData) : undefined;

    if (req.body?.idToken) {
      const jwt: IdTokenJwtPayload = jwt_decode(req.body?.idToken);
      userId = jwt?.uid;
      if (appReq.session?.user) {
        appReq.session.user.id = userId;
      }
    }

    if(!req.cookies['eligibilityCompleted']) {
      const MILLISECONDS_IN_1_HOUR = 3600000;
      res.cookie('eligibilityCompleted', true, {maxAge: MILLISECONDS_IN_1_HOUR, httpOnly: true });
    }

    const isCarmEnabled = await isCarmEnabledForCase(submittedDate);
    const caseDataToStore = rawCaseData ?? cloneDefaultDraftClaimCaseData(isCarmEnabled);
    const initialClaimData = Object.assign(new Claim(), caseDataToStore, claimWithSubmittedDate);
    if (!initialClaimData.draftClaimCreatedAt) {
      initialClaimData.draftClaimCreatedAt = submittedDate;
    }

    const draftResult = await createOrLoadDraft(appReq, initialClaimData);
    const draftId = draftResult.rawResponse?.draftId;
    const isNewDraft = draftResult.isNew;

    if (appReq.session && draftId) {
      appReq.session.draftId = draftId;
    }

    if (userId) {
      await saveDraftClaimToCache(userId, caseDataToStore, isCarmEnabled);
    }

    if (draftId) {
      await updateDraftClaim(appReq, initialClaimData, draftId);
    }

    if (isNewDraft) {
      await civilServiceClient.createDashboard(appReq);
    }

    if (req.body?.idToken && userId) {
      return res.sendStatus(200);
    }
    return res.redirect(CLAIMANT_TASK_LIST_URL);

  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default createDraftClaimController;
