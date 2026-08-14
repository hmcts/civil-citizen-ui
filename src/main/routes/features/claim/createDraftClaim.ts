import { AppRequest, AppSession } from 'common/models/AppRequest';
import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import { BILINGUAL_LANGUAGE_PREFERENCE_URL, CLAIM_CHECK_ANSWERS_URL, TESTING_SUPPORT_URL } from 'routes/urls';
import {createOrLoadDraft, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
const createDraftViewPath = 'features/claim/create-draft';
import jwt_decode from 'jwt-decode';
import {Claim} from 'models/claim';
import {saveDraftClaim} from 'modules/draft-store/draftStoreService';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CaseState} from 'common/form/models/claimDetails';
import {PartyType} from 'common/models/partyType';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const RESPONSE_TEST_CLAIM_ID = '1111222233334444';

const buildResponseTestClaim = (): Claim => Object.assign(new Claim(), {
  legacyCaseReference: '1111-2222-3333-4444',
  ccdState: CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT,
  submittedDate: new Date().toISOString(),
  respondent1ResponseDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  totalClaimAmount: 1000,
  applicant1: {
    type: PartyType.COMPANY,
    partyDetails: {partyName: 'Test Inc'},
  },
  respondent1: {
    type: PartyType.INDIVIDUAL,
    partyDetails: {
      partyName: 'Joe Defendant',
      firstName: 'Joe',
      lastName: 'Defendant',
      primaryAddress: {},
    },
  },
});

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
    const rawCaseData = req.body?.caseData ? JSON.parse(req.body?.caseData) : undefined;

    if (req.body?.draftType === 'response') {
      const responseClaim = buildResponseTestClaim();
      await saveDraftClaim(`${RESPONSE_TEST_CLAIM_ID}${userId}`, responseClaim, true, userId);
      return res.redirect(constructResponseUrlWithIdParams(RESPONSE_TEST_CLAIM_ID, BILINGUAL_LANGUAGE_PREFERENCE_URL));
    }

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
    const initialClaimData = rawCaseData
      ? Object.assign(new Claim(), rawCaseData, claimWithSubmittedDate)
      : undefined;

    let draftResult = await createOrLoadDraft(appReq, initialClaimData);

    if (appReq.session && draftResult.rawResponse?.draftId) {
      appReq.session.draftId = draftResult.rawResponse.draftId;
    }

    if (draftResult.isNew) {
      await civilServiceClient.createDashboard(appReq);
    } else if (rawCaseData && draftResult.rawResponse?.draftId) {
      const existingData = draftResult.claimResponse?.case_data || {};
      const updatedClaim = Object.assign(new Claim(), existingData, rawCaseData, claimWithSubmittedDate);
      draftResult = await updateDraftClaim(appReq, updatedClaim, draftResult.rawResponse.draftId);
    }

    if (req.body?.idToken && userId) {
      return res.sendStatus(200);
    }
    return res.redirect(CLAIM_CHECK_ANSWERS_URL);

  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default createDraftClaimController;
