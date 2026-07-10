import {NextFunction, Request, Response} from 'express';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'common/models/claim';
import {PartyType} from 'common/models/partyType';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {isPcqShutterOn} from 'app/auth/launchdarkly/launchDarklyClient';
import {getClaimantIdamDetails} from 'services/translation/response/claimantIdamDetails';
import {isFirstTimeInPCQ} from 'routes/guards/pcqGuardClaim';

jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../main/services/translation/response/claimantIdamDetails');
jest.mock('client/pcq/pcqClient', () => ({
  isPcqHealthy: jest.fn().mockResolvedValue(false),
  isPcqElegible: jest.fn(),
  generatePcqUrl: jest.fn(),
}));

const mockGetCaseDataFromStore = getCaseDataFromStore as jest.Mock;
const mockIsPcqShutterOn = isPcqShutterOn as jest.Mock;
const mockGetClaimantIdamDetails = getClaimantIdamDetails as jest.Mock;

const MOCK_RESPONSE = {redirect: jest.fn()} as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('pcqGuardClaim', () => {
  const mockClaim = new Claim();
  mockClaim.pcqId = 'existing-pcq-id';
  mockClaim.applicant1 = {type: PartyType.INDIVIDUAL} as Claim['applicant1'];

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPcqShutterOn.mockResolvedValue(false);
    mockGetCaseDataFromStore.mockResolvedValue(mockClaim);
    mockGetClaimantIdamDetails.mockReturnValue({email: 'claimant@example.com'});
  });

  it('should stash claim on req.locals and call next when PCQ id already exists', async () => {
    const req = {
      method: 'GET',
      originalUrl: '/claim/check-answers',
      query: {},
      cookies: {},
      headers: {},
      session: {user: {id: 'user-1'}},
    } as unknown as Request;

    await isFirstTimeInPCQ(req as unknown as AppRequest, MOCK_RESPONSE, MOCK_NEXT);

    expect(mockGetCaseDataFromStore).toHaveBeenCalledTimes(1);
    expect((<AppRequest>req).locals.claim).toBe(mockClaim);
    expect(MOCK_NEXT).toHaveBeenCalled();
  });

  it('should use stashed claim without a second Redis read', async () => {
    const stashedClaim = new Claim();
    stashedClaim.pcqId = 'existing-pcq-id';
    const req = {
      method: 'GET',
      originalUrl: '/claim/check-answers',
      query: {},
      cookies: {},
      headers: {},
      session: {user: {id: 'user-1'}},
      locals: {env: '', lang: '', claim: stashedClaim},
    } as unknown as Request;

    await isFirstTimeInPCQ(req as unknown as AppRequest, MOCK_RESPONSE, MOCK_NEXT);

    expect(mockGetCaseDataFromStore).not.toHaveBeenCalled();
    expect((<AppRequest>req).locals.claim).toBe(stashedClaim);
    expect(MOCK_NEXT).toHaveBeenCalled();
  });
});
