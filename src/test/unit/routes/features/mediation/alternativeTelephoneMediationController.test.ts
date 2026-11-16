import {NextFunction, Response} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {MediationCarm} from 'models/mediation/mediationCarm';
import alternativeTelephoneMediationController from 'routes/features/mediation/alternativeTelephoneMediationController';
import {MEDIATION_ALTERNATIVE_PHONE_URL, MEDIATION_EMAIL_CONFIRMATION_URL} from 'routes/urls';
import {getMediationCarm, saveMediationCarm} from 'services/features/response/mediation/mediationService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

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
const viewPath = 'features/mediation/alternative-telephone';
const telephoneNumber = '01632960001';

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
  await getRouteHandler(alternativeTelephoneMediationController, method, MEDIATION_ALTERNATIVE_PHONE_URL)(
    req as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

const renderedForm = (res: ReturnType<typeof createMockResponse>) =>
  (res.render as jest.Mock).mock.calls[0][1].form;

describe('Mediation Email Mediation Confirmation Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue(redisKey);
    mockGetMediationCarm.mockResolvedValue(new MediationCarm());
    mockSaveMediationCarm.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should return Alternative Telephone Mediation page', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.MEDIATION_ALTERNATIVE_TELEPHONE.PAGE_TITLE',
        isCarm: true,
      }));
    });

    it('should call next when loading the alternative telephone fails', async () => {
      const error = new Error('redis failure');
      mockGetMediationCarm.mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to the mediation dates confirmation page', async () => {
      const {res} = await invoke('post', {body: {alternativeTelephone: telephoneNumber}});

      expect(mockSaveMediationCarm).toHaveBeenCalledWith(redisKey, expect.anything(), 'alternativeMediationTelephone');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, MEDIATION_EMAIL_CONFIRMATION_URL));
    });

    it('should Valid Telephone when is empty', async () => {
      const {res} = await invoke('post', {body: {alternativeTelephone: ''}});

      const form = renderedForm(res);
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('alternativeTelephone')).toBe('ERRORS.PHONE_NUMBER_REQUIRED_CARM');
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should should Valid telephone when is invalid', async () => {
      const {res} = await invoke('post', {body: {alternativeTelephone: 'aaa'}});

      const form = renderedForm(res);
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('alternativeTelephone')).toBe('ERRORS.VALID_PHONE_NUMBER');
    });

    it('should call next when saving the alternative telephone fails', async () => {
      const error = new Error('redis failure');
      mockSaveMediationCarm.mockRejectedValue(error);

      const {next} = await invoke('post', {body: {alternativeTelephone: telephoneNumber}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
