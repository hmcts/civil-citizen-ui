import {NextFunction, Response} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CaseState} from 'form/models/claimDetails';
import {CaseRole} from 'form/models/caseRoles';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import telephoneMediationController from 'routes/features/mediation/telephoneMediationController';
import {CLAIMANT_RESPONSE_TASK_LIST_URL, RESPONSE_TASK_LIST_URL, TELEPHONE_MEDIATION_URL} from 'routes/urls';
import {saveMediationCarm} from 'services/features/response/mediation/mediationService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/response/mediation/mediationService', () => ({
  saveMediationCarm: jest.fn(),
}));

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(),
  getCaseDataFromStore: jest.fn(),
}));

const mockSaveMediationCarm = saveMediationCarm as jest.Mock;
const mockGenerateRedisKey = generateRedisKey as jest.Mock;
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const claimId = '1111';
const redisKey = '12345';
const viewPath = 'features/mediation/telephone-mediation.njk';

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
  await getRouteHandler(telephoneMediationController, method, TELEPHONE_MEDIATION_URL)(
    req as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

const contentTexts = (res: ReturnType<typeof createMockResponse>): string[] =>
  (res.render as jest.Mock).mock.calls[0][1].telephoneMediationContent.map(
    (section: {data: {text?: string}}) => section.data.text,
  );

describe('Telephone Mediation Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue(redisKey);
    mockGetCaseData.mockResolvedValue(new Claim());
    mockSaveMediationCarm.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should return telephone mediation page successfully when applicant is business and defendant', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({isCarm: true}));
      expect(contentTexts(res)).toContain('PAGES.TELEPHONE_FOR_MEDIATION.IF_THE_CLAIMANT_DISAGREES');
    });

    it('should return telephone mediation page successfully when applicant is business and claimant', async () => {
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      mockGetCaseData.mockResolvedValue(claim);

      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({isCarm: true}));
      expect(contentTexts(res)).toContain('PAGES.TELEPHONE_FOR_MEDIATION.YOU_WISH_TO_PROCEED_WITH_THE_CLAIM');
    });
  });

  describe('on POST', () => {
    it('should redirect to the defendant task-list when the user continues', async () => {
      const {res} = await invoke('post');

      expect(mockSaveMediationCarm).toHaveBeenCalledWith(redisKey, true, 'hasTelephoneMeditationAccessed');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect to the claimant task-list when the user continues', async () => {
      const claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      mockGetCaseData.mockResolvedValue(claim);

      const {res} = await invoke('post');

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
    });

    it('should call next when saving telephone mediation fails', async () => {
      const error = new Error('redis failure');
      mockSaveMediationCarm.mockRejectedValue(error);

      const {next} = await invoke('post', {body: {option: 'no'}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
