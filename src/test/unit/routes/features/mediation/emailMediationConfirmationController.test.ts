import {NextFunction, Response} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CaseState} from 'form/models/claimDetails';
import {GenericYesNoCarmEmailConfirmation} from 'form/models/genericYesNoCarmEmailConfirmation';
import {YesNo} from 'form/models/yesNo';
import {generateRedisKey, getCaseDataFromStore, getDraftClaimFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {MediationCarm} from 'models/mediation/mediationCarm';
import emailMediationConfirmationController from 'routes/features/mediation/emailMediationConfirmationController';
import {
  MEDIATION_ALTERNATIVE_EMAIL_URL,
  MEDIATION_EMAIL_CONFIRMATION_URL,
  MEDIATION_NEXT_3_MONTHS_URL,
} from 'routes/urls';
import {getMediationCarm, saveMediationCarm} from 'services/features/response/mediation/mediationService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('i18next', () => ({
  t: (key: string, options?: Record<string, unknown>) => {
    const extras = Object.entries(options ?? {})
      .filter(([name, value]) => name !== 'lng' && typeof value === 'string' && value.length > 0)
      .map(([, value]) => value);
    return [key, ...extras].join(' ');
  },
}));

jest.mock('services/features/response/mediation/mediationService', () => ({
  getMediationCarm: jest.fn(),
  saveMediationCarm: jest.fn(),
}));

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(),
  getCaseDataFromStore: jest.fn(),
  getDraftClaimFromStore: jest.fn(),
}));

const mockGetMediationCarm = getMediationCarm as jest.Mock;
const mockSaveMediationCarm = saveMediationCarm as jest.Mock;
const mockGenerateRedisKey = generateRedisKey as jest.Mock;
const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockGetDraftClaim = getDraftClaimFromStore as jest.Mock;

const claimId = '1111';
const redisKey = '12345';
const viewPath = 'features/common/yes-no-common-page';

const defendantClaim = (): Claim => {
  const claim = new Claim();
  claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
  return claim;
};

const claimantClaim = (): Claim => {
  const claim = new Claim();
  claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
  return claim;
};

const invoke = async (method: 'get' | 'post', overrides: Partial<AppRequest> = {}) => {
  const res = createMockResponse();
  const next = jest.fn() as NextFunction;
  const req = {
    params: {id: claimId},
    body: {},
    query: {},
    cookies: {lang: 'en'},
    session: createMockSession({user: {id: 'user-1'}}),
    ...overrides,
  };
  await getRouteHandler(emailMediationConfirmationController, method, MEDIATION_EMAIL_CONFIRMATION_URL)(
    req as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

const rendered = (res: ReturnType<typeof createMockResponse>) =>
  (res.render as jest.Mock).mock.calls[0][1];

describe('Mediation Email Mediation Confirmation Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue(redisKey);
    mockGetCaseData.mockResolvedValue(defendantClaim());
    mockGetDraftClaim.mockResolvedValue({
      case_data: {respondent1: {emailAddress: {emailAddress: 'test@test.com'}}},
    });
    mockGetMediationCarm.mockResolvedValue(new MediationCarm());
    mockSaveMediationCarm.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should return Email Mediation Confirmation page', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.MEDIATION_EMAIL_CONFIRMATION.PAGE_TITLE',
        pageText: expect.stringContaining('test@test.com'),
        isCarm: true,
      }));
    });

    it('should return claimant mediation email confirmation page when claimant response is pending', async () => {
      mockGetCaseData.mockResolvedValue(claimantClaim());
      mockGetDraftClaim.mockResolvedValue({
        case_data: {applicant1: {emailAddress: {emailAddress: 'claimant-email@test.com'}}},
      });

      const {res} = await invoke('get');

      expect(rendered(res).pageText).toEqual(expect.stringContaining('claimant-email@test.com'));
    });

    it('should preselect option when mediation email answer already exists', async () => {
      mockGetMediationCarm.mockResolvedValue(
        new MediationCarm(undefined, undefined, new GenericYesNoCarmEmailConfirmation(YesNo.YES)),
      );

      const {res} = await invoke('get');

      expect(rendered(res).form.model.option).toBe(YesNo.YES);
    });

    it('should use partyEmail when emailAddress is not available', async () => {
      mockGetDraftClaim.mockResolvedValue({
        case_data: {respondent1: {partyEmail: 'party-email@test.com'}},
      });

      const {res} = await invoke('get');

      expect(rendered(res).pageText).toEqual(expect.stringContaining('party-email@test.com'));
    });

    it('should call next when loading the email confirmation fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect page when NO', async () => {
      const {res} = await invoke('post', {body: {option: 'no'}});

      expect(mockSaveMediationCarm).toHaveBeenCalledWith(redisKey, expect.anything(), 'isMediationEmailCorrect');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, MEDIATION_ALTERNATIVE_EMAIL_URL));
    });

    it('should redirect page when Yes', async () => {
      const {res} = await invoke('post', {body: {option: 'yes'}});

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, MEDIATION_NEXT_3_MONTHS_URL));
    });

    it('should return error on incorrect input', async () => {
      const {res, next} = await invoke('post');

      const view = rendered(res);
      expect(view.form.hasErrors()).toBe(true);
      expect(view.formatValues).toEqual([{
        keyError: 'ERRORS.MEDIATION_EMAIL_CONFIRMATION_REQUIRED_RESPONDENT',
        keyToReplace: '[email]',
        valueToReplace: 'test@test.com',
      }]);
      expect(res.redirect).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should use claimantUserDetails email for claimant response when applicant email is missing', async () => {
      mockGetCaseData.mockResolvedValue(claimantClaim());
      mockGetDraftClaim.mockResolvedValue({
        case_data: {
          applicant1: {},
          claimantUserDetails: {email: 'claimant-user@test.com', id: 'id-1'},
        },
      });

      const {res} = await invoke('post');

      expect(rendered(res).form.hasErrors()).toBe(true);
      expect(rendered(res).formatValues).toEqual([{
        keyError: 'ERRORS.MEDIATION_EMAIL_CONFIRMATION_REQUIRED_CLAIMANT',
        keyToReplace: '[email]',
        valueToReplace: 'claimant-user@test.com',
      }]);
    });

    it('should return claimant validation error without an email when no claimant email source exists', async () => {
      mockGetCaseData.mockResolvedValue(claimantClaim());
      mockGetDraftClaim.mockResolvedValue({case_data: {}});

      const {res} = await invoke('post');

      expect(rendered(res).form.hasErrors()).toBe(true);
      expect(rendered(res).formatValues).toEqual([{
        keyError: 'ERRORS.MEDIATION_EMAIL_CONFIRMATION_REQUIRED_CLAIMANT',
        keyToReplace: '[email]',
        valueToReplace: '',
      }]);
    });

    it('should return defendant validation error without an email when defendant party email is missing', async () => {
      mockGetDraftClaim.mockResolvedValue({case_data: {respondent1: {}}});

      const {res} = await invoke('post');

      expect(rendered(res).form.hasErrors()).toBe(true);
      expect(rendered(res).formatValues).toEqual([{
        keyError: 'ERRORS.MEDIATION_EMAIL_CONFIRMATION_REQUIRED_RESPONDENT',
        keyToReplace: '[email]',
        valueToReplace: '',
      }]);
    });

    it('should call next when saving the email confirmation fails', async () => {
      const error = new Error('redis failure');
      mockSaveMediationCarm.mockRejectedValue(error);

      const {next} = await invoke('post', {body: {option: 'no'}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
