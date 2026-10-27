import {Response} from 'express';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'common/models/claim';
import {PartyType} from 'common/models/partyType';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {isPcqShutterOn} from 'app/auth/launchdarkly/launchDarklyClient';
import {isFirstTimeInPCQ} from 'routes/guards/pcqGuardClaim';
import {generatePcqUrl, isPcqElegible, isPcqHealthy} from 'client/pcq/pcqClient';
import {generatePcqId} from 'client/pcq/generatePcqId';
import {savePcqIdClaim} from 'client/pcq/savePcqIdClaim';
import {getClaimantIdamDetails} from 'services/translation/response/claimantIdamDetails';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('app/auth/launchdarkly/launchDarklyClient');
jest.mock('client/pcq/pcqClient');
jest.mock('client/pcq/generatePcqId');
jest.mock('client/pcq/savePcqIdClaim');
jest.mock('services/translation/response/claimantIdamDetails');

// These are direct guard calls, with no application or HTTP server.
describe('pcqGuardClaim', () => {
  let claim: Claim;
  let req: AppRequest;
  const res = {redirect: jest.fn()} as unknown as Response;
  const next = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    claim = new Claim();
    claim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      emailAddress: {emailAddress: 'old-draft-email@example.com'},
    } as Claim['applicant1'];
    req = {
      method: 'GET', originalUrl: '/claim/check-and-send',
      query: {}, cookies: {lang: 'en'}, headers: {host: 'localhost:3001'},
      params: {id: '123'}, session: {user: {id: 'user-1'}},
    } as unknown as AppRequest;
    jest.mocked(getCaseDataFromStore).mockResolvedValue(claim);
    jest.mocked(isPcqShutterOn).mockResolvedValue(false);
    jest.mocked(isPcqHealthy).mockResolvedValue(true);
    jest.mocked(isPcqElegible).mockReturnValue(true);
    jest.mocked(generatePcqId).mockReturnValue('new-pcq-id');
    jest.mocked(generatePcqUrl).mockReturnValue('https://pcq.example/start');
    jest.mocked(savePcqIdClaim).mockResolvedValue(undefined);
    jest.mocked(getClaimantIdamDetails).mockReturnValue({email: 'claimant@example.com', id: 'user-1'});
  });

  it('stashes the claim and continues when the PCQ id already exists', async () => {
    claim.pcqId = 'existing-pcq-id';
    await isFirstTimeInPCQ(req, res, next);

    expect(getCaseDataFromStore).toHaveBeenCalledTimes(1);
    expect(req.locals.claim).toBe(claim);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
    expect(generatePcqId).not.toHaveBeenCalled();
    expect(savePcqIdClaim).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('uses the stashed claim without a second Redis read', async () => {
    claim.pcqId = 'existing-pcq-id';
    req.locals = {env: '', lang: '', claim};
    await isFirstTimeInPCQ(req, res, next);

    expect(getCaseDataFromStore).not.toHaveBeenCalled();
    expect(req.locals.claim).toBe(claim);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
    expect(savePcqIdClaim).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it.each([
    [{lang: 'cy'}, 'en', 'cy'],
    [{}, 'cy', 'cy'],
    [{}, 'en', 'en'],
  ])('passes the actor, IDAM email and return URL with query %j and cookie %s', async (query, cookie, language) => {
    req.query = query;
    req.cookies.lang = cookie;
    await isFirstTimeInPCQ(req, res, next);

    expect(isPcqElegible).toHaveBeenCalledWith(PartyType.INDIVIDUAL);
    expect(generatePcqId).toHaveBeenCalledTimes(1);
    expect(savePcqIdClaim).toHaveBeenCalledTimes(1);
    expect(savePcqIdClaim).toHaveBeenCalledWith('new-pcq-id', req);
    expect(jest.mocked(savePcqIdClaim).mock.calls[0][1]).toBe(req);
    expect(generatePcqUrl).toHaveBeenCalledTimes(1);
    expect(generatePcqUrl).toHaveBeenCalledWith(
      'new-pcq-id', 'applicant', 'claimant@example.com',
      'localhost:3001/claim/check-and-send', language,
    );
    expect(getClaimantIdamDetails).toHaveBeenCalledWith(req.session.user);
    expect(req.locals.claim.pcqId).toBe('new-pcq-id');
    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith('https://pcq.example/start');
    expect(next).not.toHaveBeenCalled();
  });

  it.each(['shutter', 'unhealthy', 'ineligible'])('continues without writing or redirecting when %s', async reason => {
    jest.mocked(isPcqShutterOn).mockResolvedValue(reason === 'shutter');
    jest.mocked(isPcqHealthy).mockResolvedValue(reason !== 'unhealthy');
    jest.mocked(isPcqElegible).mockReturnValue(reason !== 'ineligible');
    await isFirstTimeInPCQ(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
    expect(generatePcqId).not.toHaveBeenCalled();
    expect(savePcqIdClaim).not.toHaveBeenCalled();
    expect(generatePcqUrl).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it.each(['read', 'health', 'save'])('forwards an independent %s failure without redirecting', async boundary => {
    const error = new Error(boundary + ' failed');
    if (boundary === 'read') jest.mocked(getCaseDataFromStore).mockRejectedValue(error);
    if (boundary === 'health') jest.mocked(isPcqHealthy).mockRejectedValue(error);
    if (boundary === 'save') jest.mocked(savePcqIdClaim).mockRejectedValue(error);
    await isFirstTimeInPCQ(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
    expect(savePcqIdClaim).toHaveBeenCalledTimes(boundary === 'save' ? 1 : 0);
    expect(generatePcqUrl).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });
});
