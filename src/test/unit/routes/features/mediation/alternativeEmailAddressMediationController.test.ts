import {NextFunction, Response} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {MediationCarm} from 'models/mediation/mediationCarm';
import alternativeEmailAddressMediationController from 'routes/features/mediation/alternativeEmailAddressMediationController';
import {MEDIATION_ALTERNATIVE_EMAIL_URL, MEDIATION_NEXT_3_MONTHS_URL} from 'routes/urls';
import {getMediationCarm, saveMediationCarm} from 'services/features/response/mediation/mediationService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';
import en from 'modules/i18n/locales/en.json';
import cy from 'modules/i18n/locales/cy.json';

jest.mock('services/features/response/mediation/mediationService', () => ({
  getMediationCarm: jest.fn(),
  saveMediationCarm: jest.fn(),
}));

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(),
}));

const mockGetMediationCarm = getMediationCarm as jest.Mock;
const mockSaveMediationCarm = saveMediationCarm as jest.Mock;
const mockGenerateRedisKey = generateRedisKey as jest.Mock;

const claimId = '1111';
const redisKey = '12345';
const viewPath = 'features/mediation/alternative-email';

const invoke = async (method: 'get' | 'post', overrides: Partial<AppRequest> = {}) => {
  const res = createMockResponse();
  const next = jest.fn() as NextFunction;
  const req = {
    params: {id: claimId},
    body: {},
    query: {},
    cookies: {},
    session: createMockSession({user: {id: 'user-1'}}),
    ...overrides,
  };
  await getRouteHandler(alternativeEmailAddressMediationController, method, MEDIATION_ALTERNATIVE_EMAIL_URL)(
    req as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Mediation Email Mediation Confirmation Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue(redisKey);
    mockGetMediationCarm.mockResolvedValue(new MediationCarm());
    mockSaveMediationCarm.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should return Alternative Email Mediation page', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.MEDIATION_ALTERNATIVE_EMAIL.PAGE_TITLE',
        isCarm: true,
      }));
    });

    it('should call next when loading the alternative email fails', async () => {
      const error = new Error('redis failure');
      mockGetMediationCarm.mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to the mediation next 3 months confirmation page', async () => {
      const {res} = await invoke('post', {body: {alternativeEmailAddress: 'test@test.com'}});

      expect(mockSaveMediationCarm).toHaveBeenCalledWith(redisKey, expect.anything(), 'alternativeMediationEmail');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, MEDIATION_NEXT_3_MONTHS_URL));
    });

    // TEMP OCCC-691 QA: invalid/empty email is accepted so it can reach civil-service.
    // Restore error expectations when AlternativeEmailAddress validators are restored.
    it('should redirect when email is empty', async () => {
      const {res} = await invoke('post', {body: {alternativeEmailAddress: ''}});

      expect(mockSaveMediationCarm).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, MEDIATION_NEXT_3_MONTHS_URL));
      expect(res.render).not.toHaveBeenCalled();
    });

    it('should redirect when email is missing', async () => {
      const {res} = await invoke('post', {body: {}});

      expect(mockSaveMediationCarm).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, MEDIATION_NEXT_3_MONTHS_URL));
      expect(res.render).not.toHaveBeenCalled();
    });

    it('should have english and welsh text for the enter alternative email error', () => {
      expect(en.ERRORS.ENTER_ALTERNATIVE_EMAIL_CARM).toBe('Enter an alternative email address');
      expect(cy.ERRORS.ENTER_ALTERNATIVE_EMAIL_CARM).toBe('Rhowch gyfeiriad e-bost amgen');
    });

    it('should redirect when email is invalid', async () => {
      const {res} = await invoke('post', {body: {alternativeEmailAddress: 'notanemail'}});

      expect(mockSaveMediationCarm).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, MEDIATION_NEXT_3_MONTHS_URL));
      expect(res.render).not.toHaveBeenCalled();
    });

    it('should call next when saving the alternative email fails', async () => {
      const error = new Error('redis failure');
      mockSaveMediationCarm.mockRejectedValue(error);

      const {next} = await invoke('post', {body: {alternativeEmailAddress: 'test@test.com'}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
