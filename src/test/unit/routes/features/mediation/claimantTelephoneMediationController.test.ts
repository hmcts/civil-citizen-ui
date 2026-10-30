import {NextFunction, Response} from 'express';
import i18next from 'i18next';
import en from 'modules/i18n/locales/en.json';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {Party} from 'models/party';
import claimantTelephoneMediationController from 'routes/features/mediation/claimantTelephoneMediationController';
import {MEDIATION_CLAIMANT_PHONE_URL, MEDIATION_PHONE_CONFIRMATION_URL} from 'routes/urls';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(),
  getCaseDataFromStore: jest.fn(),
  saveDraftClaim: jest.fn(),
}));

const mockGenerateRedisKey = generateRedisKey as jest.Mock;
const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = saveDraftClaim as jest.Mock;

const claimId = '1111';
const redisKey = '12345';
const viewPath = 'features/mediation/alternative-telephone';
const telephoneNumber = '01632960001';

const claimWithApplicant = (): Claim => {
  const claim = new Claim();
  claim.applicant1 = new Party();
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
  await getRouteHandler(claimantTelephoneMediationController, method, MEDIATION_CLAIMANT_PHONE_URL)(
    req as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

const renderedForm = (res: ReturnType<typeof createMockResponse>) =>
  (res.render as jest.Mock).mock.calls[0][1].form;

describe('Mediation claimant Telephone Controller', () => {
  beforeAll(async () => {
    await i18next.init({lng: 'en', fallbackLng: 'en', resources: {en: {translation: en}}});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue(redisKey);
    mockGetCaseData.mockResolvedValue(claimWithApplicant());
    mockSaveDraftClaim.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should open claimant phone number page', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'Your phone number',
        pageText: 'Enter a phone number',
        isCarm: true,
      }));
    });

    it('should call next when loading the claimant phone fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to the mediation phone confirmation page', async () => {
      const {res} = await invoke('post', {body: {alternativeTelephone: telephoneNumber}});

      expect(mockSaveDraftClaim).toHaveBeenCalledWith(redisKey, expect.any(Claim));
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, MEDIATION_PHONE_CONFIRMATION_URL));
    });

    it('should Valid Telephone when is empty', async () => {
      const {res} = await invoke('post', {body: {alternativeTelephone: ''}});

      const form = renderedForm(res);
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('alternativeTelephone')).toBe('ERRORS.ENTER_TELEPHONE_NUMBER');
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should should Valid telephone when is invalid', async () => {
      const {res} = await invoke('post', {body: {alternativeTelephone: 'aaa'}});

      const form = renderedForm(res);
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('alternativeTelephone')).toBe('ERRORS.VALID_PHONE_NUMBER');
    });

    it('should call next when saving the claimant phone fails', async () => {
      const error = new Error('redis failure');
      mockSaveDraftClaim.mockRejectedValue(error);

      const {next} = await invoke('post', {body: {alternativeTelephone: telephoneNumber}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
