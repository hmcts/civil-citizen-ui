import {Response} from 'express';
import checkAnswersController from 'routes/features/response/checkAnswersController';
import {RESPONSE_CHECK_ANSWERS_URL} from 'routes/urls';
import {getSummarySections} from 'services/features/response/checkAnswers/checkAnswersService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {isCarmEnabledForCase, isMintiEnabledForCase} from 'app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';
import {StatementOfMeans} from 'models/statementOfMeans';
import {CourtOrders} from 'form/models/statementOfMeans/courtOrders/courtOrders';
import {CourtOrder} from 'form/models/statementOfMeans/courtOrders/courtOrder';
import {submitResponse} from 'services/features/response/submission/submitResponse';

jest.mock('services/features/response/checkAnswers/checkAnswersService', () => {
  const actual = jest.requireActual('services/features/response/checkAnswers/checkAnswersService');
  return {
    ...actual,
    getSummarySections: jest.fn(),
    saveStatementOfTruth: jest.fn(),
  };
});
jest.mock('modules/draft-store/draftStoreService');
jest.mock('services/features/response/submission/submitResponse', () => ({
  submitResponse: jest.fn(),
}));
jest.mock('app/auth/launchdarkly/launchDarklyClient', () => ({
  isCarmEnabledForCase: jest.fn(),
  isMintiEnabledForCase: jest.fn(),
}));

const viewPath = 'features/response/check-answers';
const claimId = 'aaa';
const summarySections = {sections: [{title: 'Your details'}]};

const storedClaim = (): Claim => {
  const claim = new Claim();
  claim.respondent1 = new Party();
  claim.respondent1.type = PartyType.INDIVIDUAL;
  claim.submittedDate = new Date('2024-01-01');
  return claim;
};

const storedClaimWithCourtOrderClaimNumbers = (...claimNumbers: string[]): Claim => {
  const claim = storedClaim();
  claim.statementOfMeans = new StatementOfMeans();
  claim.statementOfMeans.courtOrders = new CourtOrders(true, claimNumbers.map(claimNumber => new CourtOrder(120, 10, claimNumber)));
  return claim;
};

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
      const {res} = await invoke('post', {body: {signed: ''}});

      expect(res.render.mock.calls[0][0]).toBe(viewPath);
      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should re-render with a claim number error and not submit when a stored court order claim number is not alphanumeric', async () => {
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(storedClaimWithCourtOrderClaimNumbers('H0QZ/1234'));

      const {res} = await invoke('post', {body: {signed: 'true'}});

      expect(res.render.mock.calls[0][0]).toBe(viewPath);
      expect(res.render.mock.calls[0][1].form.getErrors().map((error: {text: string}) => error.text))
        .toEqual(['ERRORS.VALID_CLAIM_NUMBER_ALPHANUMERIC']);
      expect(submitResponse).not.toHaveBeenCalled();
    });

    it('should submit and redirect to confirmation when stored court order claim numbers are alphanumeric', async () => {
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(storedClaimWithCourtOrderClaimNumbers('H0QZ1234'));

      const {res, next} = await invoke('post', {body: {signed: 'true'}});

      expect(next).not.toHaveBeenCalled();
      expect(submitResponse).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(`/case/${claimId}/response/confirmation`);
    });

    it('should return the error when the claim cannot be loaded', async () => {
      const error = new Error('redis failure');
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: {signed: 'true'}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
