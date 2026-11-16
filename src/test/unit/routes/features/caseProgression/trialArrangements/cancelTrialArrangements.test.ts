import {Response} from 'express';
import {CaseRole} from 'form/models/caseRoles';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {deleteDraftClaim} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import cancelTrialArrangementsController from 'routes/features/caseProgression/trialArrangements/cancelTrialArrangementsController';
import {CANCEL_TRIAL_ARRANGEMENTS, DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService', () => ({
  deleteDraftClaim: jest.fn(),
}));

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

const mockGetClaimById = getClaimById as jest.Mock;
const mockDeleteDraftClaim = deleteDraftClaim as jest.Mock;

const claimId = '1645882162449409';

const claimWithRole = (caseRole: CaseRole): Claim => {
  const claim = new Claim();
  claim.caseRole = caseRole;
  claim.applicant1 = new Party();
  return claim;
};

describe('Cancel trial arrangements', () => {
  const getHandler = getRouteHandler(cancelTrialArrangementsController, 'get', CANCEL_TRIAL_ARRANGEMENTS);

  beforeEach(() => {
    jest.clearAllMocks();
    mockDeleteDraftClaim.mockResolvedValue(undefined);
  });

  it('redirects a defendant to the defendant summary', async () => {
    mockGetClaimById.mockResolvedValue(claimWithRole(CaseRole.DEFENDANT));
    const res = createMockResponse();
    const req = {params: {id: claimId}} as unknown as AppRequest;

    await getHandler(req, res as unknown as Response, jest.fn());

    expect(mockDeleteDraftClaim).toHaveBeenCalledWith(req);
    expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL));
  });

  it('redirects a claimant to the claimant dashboard', async () => {
    mockGetClaimById.mockResolvedValue(claimWithRole(CaseRole.CLAIMANT));
    const res = createMockResponse();

    await getHandler(
      {params: {id: claimId}} as unknown as AppRequest,
      res as unknown as Response,
      jest.fn(),
    );

    expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL));
  });

  it('calls next when the claim cannot be loaded', async () => {
    const error = new Error('redis failure');
    mockGetClaimById.mockRejectedValue(error);
    const next = jest.fn();

    await getHandler(
      {params: {id: '1111'}} as unknown as AppRequest,
      createMockResponse() as unknown as Response,
      next,
    );

    expect(next).toHaveBeenCalledWith(error);
  });
});
