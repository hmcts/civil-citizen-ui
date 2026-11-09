import {NextFunction, Response} from 'express';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import freeTelephoneMediationController from 'routes/features/mediation/freeTelephoneMediationController';
import {CITIZEN_FREE_TELEPHONE_MEDIATION_URL} from 'routes/urls';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(),
  getCaseDataFromStore: jest.fn(),
}));

const mockGenerateRedisKey = generateRedisKey as jest.Mock;
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const viewPath = 'features/mediation/free-telephone-mediation';

const claimFor = (type: PartyType): Claim => {
  const claim = new Claim();
  claim.respondent1 = new Party();
  claim.respondent1.type = type;
  return claim;
};

const invoke = async (overrides: Partial<AppRequest> = {}) => {
  const res = createMockResponse();
  const next = jest.fn() as NextFunction;
  const req = {
    body: {},
    query: {},
    cookies: {},
    session: createMockSession({user: {id: 'user-1'}}),
    ...overrides,
  };
  await getRouteHandler(freeTelephoneMediationController, 'get', CITIZEN_FREE_TELEPHONE_MEDIATION_URL)(
    req as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Free Telephone Mediation Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue('12345');
  });

  describe('on GET', () => {
    it('should return free telephone mediation page successfully when applicant is business', async () => {
      mockGetCaseData.mockResolvedValue(claimFor(PartyType.ORGANISATION));

      const {res} = await invoke();

      expect(res.render).toHaveBeenCalledWith(viewPath, {
        isBusiness: true,
        pageTitle: 'PAGES.FREE_TELEPHONE_MEDIATION.PAGE_TITLE',
      });
    });

    it('should return free telephone mediation page successfully when applicant is individual', async () => {
      mockGetCaseData.mockResolvedValue(claimFor(PartyType.INDIVIDUAL));

      const {res} = await invoke();

      expect(res.render).toHaveBeenCalledWith(viewPath, {
        isBusiness: false,
        pageTitle: 'PAGES.FREE_TELEPHONE_MEDIATION.PAGE_TITLE',
      });
    });

    it('should call next when there is a Redis error', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      const {next} = await invoke();

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
