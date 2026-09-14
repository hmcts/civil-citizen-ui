import {Response} from 'express';
import checkAnswersController from '../../../../../main/routes/features/response/checkAnswersController';
import {CONFIRMATION_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Claim} from 'models/claim';
import {StatementOfTruthForm} from 'form/models/statementOfTruth/statementOfTruthForm';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {getStashedClaimOrFromStore} from 'common/utils/claimRequestLocals';
import {deleteDraftClaimFromStore, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {getStatementOfTruth, getSummarySections, saveStatementOfTruth} from 'services/features/response/checkAnswers/checkAnswersService';
import {submitResponse} from 'services/features/response/submission/submitResponse';
import {isCarmEnabledForCase, isMintiEnabledForCase} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('common/utils/claimRequestLocals', () => ({
  getStashedClaimOrFromStore: jest.fn(),
}));
jest.mock('modules/draft-store/draftStoreService');
jest.mock('services/features/response/checkAnswers/checkAnswersService', () => ({
  getSummarySections: jest.fn(),
  getStatementOfTruth: jest.fn(),
  saveStatementOfTruth: jest.fn(),
}));
jest.mock('services/features/response/submission/submitResponse', () => ({
  submitResponse: jest.fn(),
}));
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');

describe('Response - Check answers', () => {
  const getHandler = getRouteHandler(checkAnswersController, 'get');
  const postHandler = getRouteHandler(checkAnswersController, 'post');
  const viewPath = 'features/response/check-answers';
  const claimId = 'aaa';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetStashedClaim = getStashedClaimOrFromStore as jest.Mock;
  const mockGetClaim = getCaseDataFromStore as jest.Mock;
  const mockGetSummarySections = getSummarySections as jest.Mock;
  const mockGetStatementOfTruth = getStatementOfTruth as jest.Mock;
  const mockSaveStatementOfTruth = saveStatementOfTruth as jest.Mock;
  const mockSubmitResponse = submitResponse as jest.Mock;
  const mockDeleteDraftClaim = deleteDraftClaimFromStore as jest.Mock;
  const mockIsCarmEnabledForCase = isCarmEnabledForCase as jest.Mock;
  const mockIsMintiEnabledForCase = isMintiEnabledForCase as jest.Mock;

  const signedBody = {
    signed: 'true',
    type: 'basic',
    isFullAmountRejected: 'false',
  };

  beforeEach(() => {
    req = {
      params: {id: claimId},
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetStashedClaim.mockResolvedValue(new Claim());
    mockGetClaim.mockResolvedValue(new Claim());
    mockGetSummarySections.mockReturnValue({sections: []});
    mockGetStatementOfTruth.mockReturnValue(new StatementOfTruthForm(false));
    mockSaveStatementOfTruth.mockResolvedValue(undefined);
    mockSubmitResponse.mockResolvedValue(undefined);
    mockDeleteDraftClaim.mockResolvedValue(undefined);
    mockIsCarmEnabledForCase.mockResolvedValue(true);
    mockIsMintiEnabledForCase.mockResolvedValue(true);
  });

  describe('on GET', () => {
    it('should render check answers', async () => {
      req.query = {lang: 'en'};

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockGetSummarySections).toHaveBeenCalledWith(claimId, expect.any(Claim), 'en', true, true);
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        summarySections: {sections: []},
      }));
    });

    it('should pass welsh translation via query', async () => {
      req.query = {lang: 'cy'};

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockGetSummarySections).toHaveBeenCalledWith(claimId, expect.any(Claim), 'cy', true, true);
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('error');
      mockGetStashedClaim.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.render).not.toHaveBeenCalled();
    });
  });

  describe('claim stashing', () => {
    it('should not call getCaseDataFromStore on GET when the claim is stashed', async () => {
      mockGetClaim.mockClear();

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockGetStashedClaim).toHaveBeenCalled();
      expect(mockGetClaim).not.toHaveBeenCalled();
    });
  });

  describe('on POST', () => {
    it('should re-render when the form is incomplete', async () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      mockGetClaim.mockResolvedValue(claim);
      req.body = {signed: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
      const form = (res.render as jest.Mock).mock.calls[0][1].form as GenericForm<unknown>;
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('signed')).toBe('ERRORS.STATEMENT_OF_TRUTH_REQUIRED_MESSAGE');
      expect(form.errorFor('courtLocation')).toBe('ERRORS.SPECIFIC_COURT.SELECT_COURT_LOCATION');
      expect(form.errorFor('reason')).toBe('PAGES.SPECIFIC_COURT.REASON');
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to confirmation when the form is valid', async () => {
      req.body = signedBody;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveStatementOfTruth).toHaveBeenCalled();
      expect(mockSubmitResponse).toHaveBeenCalled();
      expect(mockDeleteDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CONFIRMATION_URL));
    });

    it('should call next when submitting the response fails', async () => {
      const error = new Error('error');
      mockGetClaim.mockRejectedValue(error);
      req.body = signedBody;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
