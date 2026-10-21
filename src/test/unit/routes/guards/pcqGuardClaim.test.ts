import {NextFunction, Request, Response} from 'express';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'common/models/claim';
import {PartyType} from 'common/models/partyType';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {isPcqShutterOn} from 'app/auth/launchdarkly/launchDarklyClient';
import {getClaimantIdamDetails} from 'services/translation/response/claimantIdamDetails';
import {generatePcqUrl, isPcqElegible, isPcqHealthy} from 'client/pcq/pcqClient';
import {generatePcqId} from 'client/pcq/generatePcqId';
import {savePcqIdClaim} from 'client/pcq/savePcqIdClaim';
import {isFirstTimeInPCQ} from 'routes/guards/pcqGuardClaim';

jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../main/services/translation/response/claimantIdamDetails');
jest.mock('client/pcq/pcqClient', () => ({
  isPcqHealthy: jest.fn(),
  isPcqElegible: jest.fn(),
  generatePcqUrl: jest.fn(),
}));
jest.mock('client/pcq/generatePcqId', () => ({
  generatePcqId: jest.fn(() => 'new-pcq-id'),
}));
jest.mock('client/pcq/savePcqIdClaim', () => ({
  savePcqIdClaim: jest.fn(),
}));

const mockGetCaseDataFromStore = getCaseDataFromStore as jest.Mock;
const mockIsPcqShutterOn = isPcqShutterOn as jest.Mock;
const mockGetClaimantIdamDetails = getClaimantIdamDetails as jest.Mock;
const mockIsPcqHealthy = isPcqHealthy as jest.Mock;
const mockIsPcqElegible = isPcqElegible as jest.Mock;
const mockGeneratePcqUrl = generatePcqUrl as jest.Mock;
const mockSavePcqIdClaim = savePcqIdClaim as jest.Mock;

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
    mockIsPcqHealthy.mockResolvedValue(false);
    mockIsPcqElegible.mockReturnValue(false);
    mockGeneratePcqUrl.mockReturnValue('https://pcq.example/start');
    mockSavePcqIdClaim.mockResolvedValue(undefined);
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

  const claimWithoutPcq = () => {
    const claim = new Claim();
    claim.applicant1 = {type: PartyType.INDIVIDUAL} as Claim['applicant1'];
    return claim;
  };

  const requestFor = (claim: Claim, query: Record<string, string> = {}) => ({
    method: 'GET',
    originalUrl: '/claim/check-answers',
    query,
    cookies: {lang: 'cy'},
    headers: {host: 'https://civil.example'},
    session: {user: {id: 'user-1', email: 'claimant@example.com'}},
    locals: {env: '', lang: '', claim},
  }) as unknown as Request;

  it('calls next when the PCQ shutter is on', async () => {
    mockIsPcqShutterOn.mockResolvedValue(true);

    await isFirstTimeInPCQ(requestFor(claimWithoutPcq()) as unknown as AppRequest, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_NEXT).toHaveBeenCalledWith();
    expect(mockIsPcqHealthy).not.toHaveBeenCalled();
  });

  it('redirects to PCQ when the service is healthy and the claimant is eligible', async () => {
    const claim = claimWithoutPcq();
    mockIsPcqHealthy.mockResolvedValue(true);
    mockIsPcqElegible.mockReturnValue(true);

    await isFirstTimeInPCQ(requestFor(claim, {lang: 'en'}) as unknown as AppRequest, MOCK_RESPONSE, MOCK_NEXT);

    expect(generatePcqId).toHaveBeenCalled();
    expect(mockSavePcqIdClaim).toHaveBeenCalledWith('new-pcq-id', expect.anything());
    expect(claim.pcqId).toBe('new-pcq-id');
    expect(mockGeneratePcqUrl).toHaveBeenCalledWith(
      'new-pcq-id',
      'applicant',
      'claimant@example.com',
      expect.stringContaining('https://civil.example'),
      'en',
    );
    expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith('https://pcq.example/start');
  });

  it('calls next when the claimant is not eligible for PCQ', async () => {
    mockIsPcqHealthy.mockResolvedValue(true);
    mockIsPcqElegible.mockReturnValue(false);

    await isFirstTimeInPCQ(requestFor(claimWithoutPcq()) as unknown as AppRequest, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_NEXT).toHaveBeenCalledWith();
    expect(MOCK_RESPONSE.redirect).not.toHaveBeenCalled();
  });

  it('passes a store error to next', async () => {
    const error = new Error('store down');
    mockGetCaseDataFromStore.mockRejectedValue(error);
    const req = {
      query: {},
      cookies: {},
      headers: {},
      session: {user: {id: 'user-1'}},
    } as unknown as Request;

    await isFirstTimeInPCQ(req as unknown as AppRequest, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_NEXT).toHaveBeenCalledWith(error);
  });
});
