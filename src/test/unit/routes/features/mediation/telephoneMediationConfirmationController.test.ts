import {NextFunction, Response} from 'express';
import i18next from 'i18next';
import en from 'modules/i18n/locales/en.json';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CaseState} from 'form/models/claimDetails';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {generateRedisKey, getCaseDataFromStore, getDraftClaimFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {MediationCarm} from 'models/mediation/mediationCarm';
import telephoneMediationConfirmationController from 'routes/features/mediation/telephoneMediationConfirmationController';
import {
  MEDIATION_ALTERNATIVE_PHONE_URL,
  MEDIATION_EMAIL_CONFIRMATION_URL,
  MEDIATION_PHONE_CONFIRMATION_URL,
} from 'routes/urls';
import {getMediationCarm, saveMediationCarm} from 'services/features/response/mediation/mediationService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

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
  await getRouteHandler(telephoneMediationConfirmationController, method, MEDIATION_PHONE_CONFIRMATION_URL)(
    req as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

const rendered = (res: ReturnType<typeof createMockResponse>) =>
  (res.render as jest.Mock).mock.calls[0][1];

describe('Mediation Email Mediation Confirmation Controller', () => {
  beforeAll(async () => {
    await i18next.init({lng: 'en', fallbackLng: 'en', resources: {en: {translation: en}}});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue(redisKey);
    mockGetCaseData.mockResolvedValue(defendantClaim());
    mockGetDraftClaim.mockResolvedValue({
      case_data: {respondent1: {partyPhone: {phone: '111111'}}},
    });
    mockGetMediationCarm.mockResolvedValue(new MediationCarm());
    mockSaveMediationCarm.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should return Email Mediation Confirmation page', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.MEDIATION_PHONE_CONFIRMATION.PAGE_TITLE',
        pageText: expect.stringContaining('111111'),
        isCarm: true,
      }));
    });

    it('should return claimant mediation phone confirmation page when claimant response is pending', async () => {
      mockGetCaseData.mockResolvedValue(claimantClaim());
      mockGetDraftClaim.mockResolvedValue({
        case_data: {applicant1: {partyPhone: {phone: '444444'}}},
      });

      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageText: expect.stringContaining('444444'),
      }));
    });

    it('should preselect option when mediation phone answer already exists', async () => {
      mockGetMediationCarm.mockResolvedValue(
        new MediationCarm(undefined, undefined, undefined, undefined, new GenericYesNo(YesNo.YES)),
      );

      const {res} = await invoke('get');

      expect(rendered(res).form.model.option).toBe(YesNo.YES);
    });

    it('should use string partyPhone when returned as a string value', async () => {
      mockGetDraftClaim.mockResolvedValue({
        case_data: {respondent1: {partyPhone: '222222'}},
      });

      const {res} = await invoke('get');

      expect(rendered(res).pageText).toEqual(expect.stringContaining('222222'));
    });

    it('should call next when loading the phone confirmation fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect page when NO', async () => {
      const {res} = await invoke('post', {body: {option: 'no'}});

      expect(mockSaveMediationCarm).toHaveBeenCalledWith(redisKey, expect.anything(), 'isMediationPhoneCorrect');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, MEDIATION_ALTERNATIVE_PHONE_URL));
    });

    it('should redirect page when Yes', async () => {
      const {res} = await invoke('post', {body: {option: 'yes'}});

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, MEDIATION_EMAIL_CONFIRMATION_URL));
    });

    it('should return error on incorrect input', async () => {
      const {res, next} = await invoke('post');

      const view = rendered(res);
      expect(view.form.hasErrors()).toBe(true);
      expect(view.formatValues).toEqual([{
        keyError: 'ERRORS.MEDIATION_PHONE_CONFIRMATION_REQUIRED_RESPONDENT',
        keyToReplace: '[phone number]',
        valueToReplace: '111111',
      }]);
      expect(res.redirect).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should use claimant fallback phone number when claimant party phone is missing', async () => {
      mockGetCaseData.mockResolvedValue(claimantClaim());
      mockGetDraftClaim.mockResolvedValue({
        case_data: {
          claimantResponse: {
            mediation: {canWeUse: {mediationPhoneNumber: '333333'}},
          },
        },
      });

      const {res} = await invoke('post');

      expect(rendered(res).form.hasErrors()).toBe(true);
      expect(rendered(res).formatValues).toEqual([{
        keyError: 'ERRORS.MEDIATION_PHONE_CONFIRMATION_REQUIRED_CLAIMANT',
        keyToReplace: '[number]',
        valueToReplace: '333333',
      }]);
    });

    it('should return claimant validation error without a phone when no claimant phone source exists', async () => {
      mockGetCaseData.mockResolvedValue(claimantClaim());
      mockGetDraftClaim.mockResolvedValue({case_data: {}});

      const {res} = await invoke('post');

      expect(rendered(res).form.hasErrors()).toBe(true);
      expect(rendered(res).formatValues).toEqual([{
        keyError: 'ERRORS.MEDIATION_PHONE_CONFIRMATION_REQUIRED_CLAIMANT',
        keyToReplace: '[number]',
        valueToReplace: '',
      }]);
    });

    it('should return defendant validation error without a phone when defendant party phone is missing', async () => {
      mockGetDraftClaim.mockResolvedValue({case_data: {respondent1: {}}});

      const {res} = await invoke('post');

      expect(rendered(res).form.hasErrors()).toBe(true);
      expect(rendered(res).formatValues).toEqual([{
        keyError: 'ERRORS.MEDIATION_PHONE_CONFIRMATION_REQUIRED_RESPONDENT',
        keyToReplace: '[phone number]',
        valueToReplace: '',
      }]);
    });

    it('should call next when saving the phone confirmation fails', async () => {
      const error = new Error('redis failure');
      mockSaveMediationCarm.mockRejectedValue(error);

      const {next} = await invoke('post', {body: {option: 'no'}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
