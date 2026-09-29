import {Response} from 'express';
import claimCheckAnswersController from '../../../../../main/routes/features/claim/checkAnswersController';
import {CLAIM_CONFIRMATION_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {YesNo} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {HelpWithFees} from 'form/models/claim/details/helpWithFees';
import {Party} from 'models/party';
import {Email} from 'models/Email';
import {PartyPhone} from 'models/PartyPhone';
import {GenericForm} from 'form/models/genericForm';
import {StatementOfTruthFormClaimIssue} from 'form/models/statementOfTruth/statementOfTruthFormClaimIssue';
import {getStashedClaimOrFromStore} from 'common/utils/claimRequestLocals';
import {deleteDraftClaimFromStore, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {getStatementOfTruth, getSummarySections, saveStatementOfTruth} from 'services/features/claim/checkAnswers/checkAnswersService';
import {submitClaim} from 'services/features/claim/submission/submitClaim';
import {saveClaimFee} from 'services/features/claim/amount/claimFeesService';
import {calculateInterestToDate} from 'common/utils/interestUtils';
import {isCarmEnabledForCase} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {CivilServiceClient} from 'client/civilServiceClient';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('common/utils/claimRequestLocals', () => ({
  getStashedClaimOrFromStore: jest.fn(),
}));
jest.mock('modules/draft-store/draftStoreService');
jest.mock('services/features/claim/checkAnswers/checkAnswersService', () => ({
  getSummarySections: jest.fn(),
  getStatementOfTruth: jest.fn(),
  saveStatementOfTruth: jest.fn(),
}));
jest.mock('services/features/claim/submission/submitClaim', () => ({
  submitClaim: jest.fn(),
}));
jest.mock('services/features/claim/amount/claimFeesService', () => ({
  saveClaimFee: jest.fn(),
}));
jest.mock('common/utils/interestUtils', () => ({
  calculateInterestToDate: jest.fn(),
}));
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');

describe('Claim - Check answers', () => {
  const getHandler = getRouteHandler(claimCheckAnswersController, 'get');
  const postHandler = getRouteHandler(claimCheckAnswersController, 'post');
  const viewPath = 'features/claim/check-answers';
  const pageTitle = 'PAGES.CHECK_YOUR_ANSWER.TITLE';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetStashedClaim = getStashedClaimOrFromStore as jest.Mock;
  const mockGetClaim = getCaseDataFromStore as jest.Mock;
  const mockGetSummarySections = getSummarySections as jest.Mock;
  const mockGetStatementOfTruth = getStatementOfTruth as jest.Mock;
  const mockSaveStatementOfTruth = saveStatementOfTruth as jest.Mock;
  const mockSubmitClaim = submitClaim as jest.Mock;
  const mockSaveClaimFee = saveClaimFee as jest.Mock;
  const mockCalculateInterestToDate = calculateInterestToDate as jest.Mock;
  const mockIsCarmEnabledForCase = isCarmEnabledForCase as jest.Mock;
  const mockDeleteDraftClaim = deleteDraftClaimFromStore as jest.Mock;

  const signedBody = {
    signed: 'Test',
    type: 'qualified',
    isFullAmountRejected: 'true',
    directionsQuestionnaireSigned: 'Test',
    signerRole: 'Test',
    signerName: 'Test',
    acceptNoChangesAllowed: 'true',
  };

  const buildClaim = (helpWithFees: YesNo, withClaimantPhone = true): Claim => {
    const claim = new Claim();
    claim.applicant1 = new Party();
    claim.applicant1.emailAddress = new Email('aaaa@gmail.com');
    if (withClaimantPhone) {
      claim.applicant1.partyPhone = new PartyPhone('07557350546');
    }
    claim.respondent1 = new Party();
    claim.respondent1.emailAddress = new Email('aaaa@gmail.com');
    claim.respondent1.partyPhone = new PartyPhone('07557350546');
    claim.claimDetails = new ClaimDetails();
    claim.claimDetails.helpWithFees = new HelpWithFees(helpWithFees);
    claim.totalClaimAmount = 1000;
    return claim;
  };

  beforeEach(() => {
    req = {
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetStashedClaim.mockResolvedValue(buildClaim(YesNo.NO));
    mockGetClaim.mockResolvedValue(buildClaim(YesNo.NO));
    mockGetSummarySections.mockReturnValue({sections: []});
    mockGetStatementOfTruth.mockReturnValue(new StatementOfTruthFormClaimIssue(false));
    mockSaveStatementOfTruth.mockResolvedValue(undefined);
    mockSaveClaimFee.mockResolvedValue(undefined);
    mockCalculateInterestToDate.mockResolvedValue(0);
    mockIsCarmEnabledForCase.mockResolvedValue(true);
    mockDeleteDraftClaim.mockResolvedValue(undefined);
    jest.spyOn(CivilServiceClient.prototype, 'getClaimFeeData').mockResolvedValue({
      calculatedAmountInPence: '50',
    } as never);
  });

  describe('on GET', () => {
    it('should render check answers', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
        summarySections: {sections: []},
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

  describe('on POST', () => {
    it('should re-render when the statement of truth is unsigned', async () => {
      req.body = {
        type: 'qualified',
        isFullAmountRejected: 'true',
        directionsQuestionnaireSigned: 'Test',
        signerRole: 'Test',
        signerName: 'Test',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
      }));
      const form = (res.render as jest.Mock).mock.calls[0][1].form as GenericForm<unknown>;
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('signed')).toBe('ERRORS.STATEMENT_OF_TRUTH_REQUIRED_MESSAGE');
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should re-render when claimant phone number is missing', async () => {
      mockGetClaim.mockResolvedValue(buildClaim(YesNo.NO, false));
      req.body = signedBody;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      const form = (res.render as jest.Mock).mock.calls[0][1].form as GenericForm<unknown>;
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('alternativeTelephone')).toBe('ERRORS.ENTER_VALID_PHONE_CLAIMANT');
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to confirmation and clear cookies when help with fees is yes', async () => {
      mockGetClaim.mockResolvedValue(buildClaim(YesNo.YES));
      const submittedClaim = new Claim();
      submittedClaim.id = 'claim-id';
      mockSubmitClaim.mockResolvedValue(submittedClaim);
      req.body = signedBody;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.clearCookie).toHaveBeenCalledWith('eligibilityCompleted');
      expect(res.clearCookie).toHaveBeenCalledWith('eligibility');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(submittedClaim.id, CLAIM_CONFIRMATION_URL));
    });

    it('should redirect to confirmation and clear cookies when help with fees is no', async () => {
      mockGetClaim.mockResolvedValue(buildClaim(YesNo.NO));
      const submittedClaim = new Claim();
      submittedClaim.id = 'claim-id';
      mockSubmitClaim.mockResolvedValue(submittedClaim);
      req.body = signedBody;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.clearCookie).toHaveBeenCalledWith('eligibilityCompleted');
      expect(res.clearCookie).toHaveBeenCalledWith('eligibility');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(submittedClaim.id, CLAIM_CONFIRMATION_URL));
    });

    it('should call next when submitting the claim fails', async () => {
      const error = new Error('error');
      mockGetClaim.mockRejectedValue(error);

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
