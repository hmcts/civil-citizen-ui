import {Response} from 'express';
import checkAnswersController from 'routes/features/response/checkAnswersController';
import {RESPONSE_CHECK_ANSWERS_URL} from 'routes/urls';
import {getSummarySections, saveStatementOfTruth} from 'services/features/response/checkAnswers/checkAnswersService';
import {deleteDraftClaimFromStore, generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {isCarmEnabledForCase, isMintiEnabledForCase} from 'app/auth/launchdarkly/launchDarklyClient';
import {submitResponse} from 'services/features/response/submission/submitResponse';
import {CallbackError} from 'client/common/error/callbackError';
import {GenericForm} from 'form/models/genericForm';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
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
jest.mock('services/features/response/submission/submitResponse', () => ({
  submitResponse: jest.fn(),
}));
jest.mock('modules/draft-store/draftStoreService');
jest.mock('app/auth/launchdarkly/launchDarklyClient', () => ({
  isCarmEnabledForCase: jest.fn(),
  isMintiEnabledForCase: jest.fn(),
}));
jest.mock('i18next', () => ({
  t: (i: string) => i,
  use: jest.fn(),
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

    it('should return the error when the claim cannot be loaded', async () => {
      const error = new Error('redis failure');
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: {signed: 'true'}});

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should re-render with GDS errors when submitResponse throws CallbackError with field errors', async () => {
      (saveStatementOfTruth as jest.Mock).mockResolvedValue(undefined);
      (getSummarySections as jest.Mock).mockReturnValue({
        sections: [{
          title: 'Your details',
          summaryList: {
            rows: [{
              key: {text: 'Email'},
              value: {html: 'notanemail'},
              ccdFieldId: 'respondent1.partyEmail',
            }],
          },
        }],
      });
      (submitResponse as jest.Mock).mockRejectedValue(new CallbackError(
        [],
        [],
        [{id: 'respondent1.partyEmail', message: 'notanemail is not a valid Email address'}],
      ));

      const {res, next} = await invoke('post', {body: {signed: 'true'}});

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        unmappedCcdFieldErrors: [],
      }));
      const form = res.render.mock.calls[0][1].form as GenericForm<unknown>;
      expect(form.errorFor('ccd-field-respondent1-partyEmail'))
        .toBe('ERRORS.ENTER_VALID_ANSWER_BEFORE_SUBMITTING');
      expect(res.redirect).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
      expect(deleteDraftClaimFromStore).not.toHaveBeenCalled();
    });

    it('should call next when submitResponse throws CallbackError with only callbackErrors', async () => {
      (saveStatementOfTruth as jest.Mock).mockResolvedValue(undefined);
      const callbackError = new CallbackError(['Please come back later.']);
      (submitResponse as jest.Mock).mockRejectedValue(callbackError);

      const {res, next} = await invoke('post', {body: {signed: 'true'}});

      expect(next).toHaveBeenCalledWith(callbackError);
      expect(res.render).not.toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });
});
