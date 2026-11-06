import {Response} from 'express';
import checkAnswersController from 'routes/features/response/checkAnswersController';
import {CONFIRMATION_URL, RESPONSE_CHECK_ANSWERS_URL} from 'routes/urls';
import {getSummarySections, saveStatementOfTruth} from 'services/features/response/checkAnswers/checkAnswersService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {
  deleteResponseDraft,
  getResponseClaimById,
  getResponseDraft,
} from 'modules/draft-store/response/responseDraftStoreService';
import {submitResponse} from 'services/features/response/submission/submitResponse';
import {isCarmEnabledForCase, isMintiEnabledForCase} from 'app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/response/checkAnswers/checkAnswersService', () => {
  const actual = jest.requireActual('services/features/response/checkAnswers/checkAnswersService');
  return {
    ...actual,
    getSummarySections: jest.fn(),
    saveStatementOfTruth: jest.fn(),
  };
});
jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/draft-store/response/responseDraftStoreService');
jest.mock('services/features/response/submission/submitResponse');
jest.mock('app/auth/launchdarkly/launchDarklyClient', () => ({
  isCarmEnabledForCase: jest.fn(),
  isMintiEnabledForCase: jest.fn(),
  isDraftClaimDatabaseEnabled: jest.fn().mockResolvedValue(false),
}));

const viewPath = 'features/response/check-answers';
const claimId = 'aaa';
const summarySections = {sections: [{title: 'Your details'}]};
const draftId = 'draft-123';

const storedClaim = (): Claim => {
  const claim = new Claim();
  claim.respondent1 = new Party();
  claim.respondent1.type = PartyType.INDIVIDUAL;
  claim.submittedDate = new Date('2024-01-01');
  return claim;
};

const mockDraftResult = (claim: Claim = storedClaim()) => ({
  claimResponse: {id: draftId, case_data: claim},
  rawResponse: {draftId, payload: claim},
  createdAt: '',
  updatedAt: '',
  expiresAt: '',
});

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(checkAnswersController, method, RESPONSE_CHECK_ANSWERS_URL)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
      ...req,
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Response - Check answers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getCaseDataFromStore as jest.Mock).mockImplementation(async () => storedClaim());
    (getSummarySections as jest.Mock).mockReturnValue(summarySections);
    (isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
    (isMintiEnabledForCase as jest.Mock).mockResolvedValue(false);
    (getResponseClaimById as jest.Mock).mockResolvedValue(storedClaim());
    (getResponseDraft as jest.Mock).mockResolvedValue(mockDraftResult());
    (deleteResponseDraft as jest.Mock).mockResolvedValue(undefined);
    (saveStatementOfTruth as jest.Mock).mockResolvedValue(undefined);
    (submitResponse as jest.Mock).mockResolvedValue(storedClaim());
  });

  describe('on GET', () => {
    it('should render check your answers in the requested language', async () => {
      const claim = storedClaim();
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);

      const {res} = await invoke('get', {query: {lang: 'cy'}});

      expect(getSummarySections).toHaveBeenCalledWith(claimId, claim, 'cy', false, false);
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({summarySections}));
    });

    it('should use a claim already stashed on the request', async () => {
      const claim = storedClaim();

      await invoke('get', {locals: {env: '', lang: '', claim}, cookies: {lang: 'en'}});

      expect(getCaseDataFromStore).not.toHaveBeenCalled();
      expect(getSummarySections).toHaveBeenCalledWith(claimId, claim, 'en', false, false);
    });

    it('should return the error when summary sections cannot be built', async () => {
      const error = new Error('redis failure');
      (getSummarySections as jest.Mock).mockImplementation(() => {
        throw error;
      });

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when the statement of truth is not signed', async () => {
      const claimWithDq = storedClaim();
      claimWithDq.directionQuestionnaire = new DirectionQuestionnaire();
      claimWithDq.directionQuestionnaire.hearing = new Hearing();
      (getResponseClaimById as jest.Mock).mockResolvedValue(claimWithDq);

      const {res} = await invoke('post', {body: {signed: ''}});

      expect(res.render.mock.calls[0][0]).toBe(viewPath);
      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(deleteResponseDraft).not.toHaveBeenCalled();
    });

    it('should save, submit and delete the response draft on successful post', async () => {
      const {res} = await invoke('post', {
        body: {
          signed: 'true',
          type: 'basic',
          isFullAmountRejected: 'false',
          directionsQuestionnaireSigned: 'true',
        },
      });

      expect(saveStatementOfTruth).toHaveBeenCalledWith(
        expect.anything(),
        claimId,
        expect.anything(),
      );
      expect(getResponseDraft).toHaveBeenCalled();
      expect(submitResponse).toHaveBeenCalled();
      expect(deleteResponseDraft).toHaveBeenCalledWith(
        expect.anything(),
        claimId,
        draftId,
      );
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, CONFIRMATION_URL),
      );
    });

    it('should return the error when the claim cannot be loaded', async () => {
      const error = new Error('draft failure');
      (getResponseClaimById as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: {signed: 'true'}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
