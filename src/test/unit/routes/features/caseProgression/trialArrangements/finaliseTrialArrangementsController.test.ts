import {Response} from 'express';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseRole} from 'form/models/caseRoles';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {getFinaliseTrialArrangementContents} from 'services/features/caseProgression/trialArrangements/finaliseYourTrialStartScreenContent';
import finaliseTrialArrangementsController from 'routes/features/caseProgression/trialArrangements/finaliseTrialArrangementsController';
import {CP_FINALISE_TRIAL_ARRANGEMENTS_URL, DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {retrieveClaimDetails: jest.fn()};
  return {CivilServiceClient: jest.fn(() => methods)};
});

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(() => 'redis-key'),
  saveDraftClaim: jest.fn(),
}));

jest.mock('services/features/caseProgression/trialArrangements/finaliseYourTrialStartScreenContent', () => ({
  getFinaliseTrialArrangementContents: jest.fn(() => [{section: 'finalise'}]),
}));

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  retrieveClaimDetails: jest.Mock;
};
const mockSaveDraftClaim = saveDraftClaim as jest.Mock;
const mockContents = getFinaliseTrialArrangementContents as jest.Mock;

const claimId = '1645882162449409';
const viewPath = 'features/caseProgression/trialArrangements/finalise-trial-arrangements';

const claimWithRole = (caseRole: CaseRole): Claim => {
  const claim = new Claim();
  claim.id = claimId;
  claim.caseRole = caseRole;
  claim.totalClaimAmount = 15000;
  claim.applicant1 = new Party();
  return claim;
};

describe('finalise trial arrangements', () => {
  const getHandler = getRouteHandler(finaliseTrialArrangementsController, 'get', CP_FINALISE_TRIAL_ARRANGEMENTS_URL);

  beforeEach(() => {
    jest.clearAllMocks();
    mockSaveDraftClaim.mockResolvedValue(undefined);
    mockContents.mockReturnValue([{section: 'finalise'}]);
  });

  it('saves the claim and renders the claimant page', async () => {
    const claim = claimWithRole(CaseRole.CLAIMANT);
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);
    const res = createMockResponse();
    const req = {params: {id: claimId}, query: {lang: 'en'}, cookies: {}, session: {user: {id: 'user-1'}}} as unknown as AppRequest;

    await getHandler(req, res as unknown as Response, jest.fn());

    expect(mockSaveDraftClaim).toHaveBeenCalledWith('redis-key', claim, false, 'user-1');
    expect(generateRedisKey).toHaveBeenCalledWith(req);
    expect(mockContents).toHaveBeenCalledWith(claimId, claim, 'en');
    expect(res.render).toHaveBeenCalledWith(viewPath, {
      finaliseYourTrialContents: [{section: 'finalise'}],
      dashboardUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
    });
  });

  it('renders the defendant dashboard link', async () => {
    const claim = claimWithRole(CaseRole.DEFENDANT);
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);
    const res = createMockResponse();

    await getHandler(
      {params: {id: claimId}, query: {}, cookies: {lang: 'cy'}, session: {user: {}}} as unknown as AppRequest,
      res as unknown as Response,
      jest.fn(),
    );

    expect(mockContents).toHaveBeenCalledWith(claimId, claim, 'cy');
    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      dashboardUrl: constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL),
    }));
  });

  it('calls next when the claim cannot be loaded', async () => {
    const error = new Error('not found');
    civilServiceMethods.retrieveClaimDetails.mockRejectedValue(error);
    const next = jest.fn();

    await getHandler(
      {params: {id: '1111'}, query: {}, cookies: {}, session: {user: {}}} as unknown as AppRequest,
      createMockResponse() as unknown as Response,
      next,
    );

    expect(next).toHaveBeenCalledWith(error);
  });
});
