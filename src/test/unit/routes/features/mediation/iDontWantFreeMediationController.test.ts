import {NextFunction, Response} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CaseState} from 'form/models/claimDetails';
import {NoMediationReason} from 'form/models/mediation/noMediationReason';
import {NoMediationReasonOptions} from 'form/models/mediation/noMediationReasonOptions';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {Mediation} from 'models/mediation/mediation';
import iDontWantFreeMediationController from 'routes/features/mediation/iDontWantFreeMediationController';
import {CLAIMANT_RESPONSE_TASK_LIST_URL, DONT_WANT_FREE_MEDIATION_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {getMediation, saveMediation} from 'services/features/response/mediation/mediationService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/response/mediation/mediationService', () => ({
  getMediation: jest.fn(),
  saveMediation: jest.fn(),
}));

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(),
  getCaseDataFromStore: jest.fn(),
}));

const mockGetMediation = getMediation as jest.Mock;
const mockSaveMediation = saveMediation as jest.Mock;
const mockGenerateRedisKey = generateRedisKey as jest.Mock;
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const claimId = '1111';
const redisKey = '12345';
const viewPath = 'features/mediation/i-dont-want-free-mediation';

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
  await getRouteHandler(iDontWantFreeMediationController, method, DONT_WANT_FREE_MEDIATION_URL)(
    req as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

const rendered = (res: ReturnType<typeof createMockResponse>) =>
  (res.render as jest.Mock).mock.calls[0][1];

describe('I dont want free meditation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue(redisKey);
    mockGetCaseData.mockResolvedValue(new Claim());
    mockGetMediation.mockResolvedValue(new Mediation());
    mockSaveMediation.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should return I dont want free meditation page', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.I_DON_T_WANT_FREE_MEDIATION.PAGE_TITLE',
        redirectUrl: constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL),
        NoMediationReasonOptions,
      }));
    });

    it('should return the page with a saved reason when mediation has noMediationReason', async () => {
      const mediation = new Mediation();
      mediation.noMediationReason = new NoMediationReason(NoMediationReasonOptions.ALREADY_TRIED, '');
      mockGetMediation.mockResolvedValue(mediation);

      const {res} = await invoke('get');

      expect(rendered(res).form.model.iDoNotWantMediationReason).toBe(NoMediationReasonOptions.ALREADY_TRIED);
      expect(rendered(res).NoMediationReasonOptions).toBe(NoMediationReasonOptions);
    });

    it('should call next when loading the page fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect page when OTHER', async () => {
      const {res} = await invoke('post', {
        body: {disagreeMediationOption: NoMediationReasonOptions.OTHER, otherReason: 'Other reason'},
      });

      expect(mockSaveMediation).toHaveBeenCalledWith(
        redisKey,
        expect.objectContaining({
          iDoNotWantMediationReason: NoMediationReasonOptions.OTHER,
          otherReason: 'Other reason',
        }),
        'noMediationReason',
      );
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect page when a listed reason is selected and clear otherReason', async () => {
      const {res} = await invoke('post', {
        body: {disagreeMediationOption: NoMediationReasonOptions.NOT_SURE, otherReason: 'unused'},
      });

      expect(mockSaveMediation).toHaveBeenCalledWith(
        redisKey,
        expect.objectContaining({
          iDoNotWantMediationReason: NoMediationReasonOptions.NOT_SURE,
          otherReason: '',
        }),
        'noMediationReason',
      );
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect page when Claimant Response journey', async () => {
      const claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      mockGetCaseData.mockResolvedValue(claim);

      const {res} = await invoke('post', {
        body: {disagreeMediationOption: NoMediationReasonOptions.NO_DELAY_IN_HEARING, otherReason: ''},
      });

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
    });

    it('should return error on incorrect input', async () => {
      const {res} = await invoke('post');

      const form = rendered(res).form;
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('iDoNotWantMediationReason')).toBe('ERRORS.OPTION_REQUIRED');
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should return error when no reason enter', async () => {
      const {res} = await invoke('post', {
        body: {disagreeMediationOption: NoMediationReasonOptions.OTHER, otherReason: ''},
      });

      const form = rendered(res).form;
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('otherReason')).toBe('ERRORS.SPECIFY_A_REASON');
    });

    it('should call next when saving the reason fails', async () => {
      const error = new Error('redis failure');
      mockSaveMediation.mockRejectedValue(error);

      const {next} = await invoke('post', {
        body: {disagreeMediationOption: NoMediationReasonOptions.NO_DELAY_IN_HEARING, otherReason: ''},
      });

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
