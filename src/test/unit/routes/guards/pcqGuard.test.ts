import {NextFunction, Request, Response} from 'express';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'common/models/claim';
import {PartyType} from 'common/models/partyType';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {isPcqShutterOn} from 'app/auth/launchdarkly/launchDarklyClient';
import {isFirstTimeInPCQ} from 'routes/guards/pcqGuard';

jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('client/pcq/pcqClient', () => ({
  isPcqHealthy: jest.fn().mockResolvedValue(false),
  isPcqElegible: jest.fn(),
  generatePcqUrl: jest.fn(),
}));

const mockGetCaseDataFromStore = getCaseDataFromStore as jest.Mock;
const mockIsPcqShutterOn = isPcqShutterOn as jest.Mock;

const MOCK_RESPONSE = {redirect: jest.fn()} as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('pcqGuard', () => {
  const mockClaim = new Claim();
  mockClaim.respondentResponsePcqId = 'existing-pcq-id';
  mockClaim.respondent1 = {type: PartyType.INDIVIDUAL} as Claim['respondent1'];

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPcqShutterOn.mockResolvedValue(false);
    mockGetCaseDataFromStore.mockResolvedValue(mockClaim);
  });

  it('should stash claim on req.locals and call next when PCQ id already exists', async () => {
    const req = {
      method: 'GET',
      originalUrl: '/case/123/response/check-and-send',
      query: {},
      cookies: {},
      headers: {},
      params: {id: '123'},
      session: {user: {id: 'user-1'}},
    } as unknown as Request;

    await isFirstTimeInPCQ(req, MOCK_RESPONSE, MOCK_NEXT);

    expect(mockGetCaseDataFromStore).toHaveBeenCalledTimes(1);
    expect((<AppRequest>req).locals.claim).toBe(mockClaim);
    expect(MOCK_NEXT).toHaveBeenCalled();
  });

  it('should use stashed claim without a second Redis read', async () => {
    const stashedClaim = new Claim();
    stashedClaim.respondentResponsePcqId = 'existing-pcq-id';
    const req = {
      method: 'GET',
      originalUrl: '/case/123/response/check-and-send',
      query: {},
      cookies: {},
      headers: {},
      params: {id: '123'},
      session: {user: {id: 'user-1'}},
      locals: {env: '', lang: '', claim: stashedClaim},
    } as unknown as Request;

    await isFirstTimeInPCQ(req, MOCK_RESPONSE, MOCK_NEXT);

    expect(mockGetCaseDataFromStore).not.toHaveBeenCalled();
    expect((<AppRequest>req).locals.claim).toBe(stashedClaim);
    expect(MOCK_NEXT).toHaveBeenCalled();
  });
});
