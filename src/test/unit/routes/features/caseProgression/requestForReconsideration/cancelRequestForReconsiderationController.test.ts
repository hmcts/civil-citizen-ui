import {Response} from 'express';
import {CaseRole} from 'form/models/caseRoles';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {deleteFieldDraftClaimFromStore, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import cancelRequestForReconsiderationController from 'routes/features/caseProgression/requestForReconsideration/cancelRequestForReconsiderationController';
import {DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL, REQUEST_FOR_RECONSIDERATION_CANCEL_URL} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(() => 'redis-key'),
  deleteFieldDraftClaimFromStore: jest.fn(),
}));

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

const mockGetClaimById = getClaimById as jest.Mock;
const mockDeleteField = deleteFieldDraftClaimFromStore as jest.Mock;

const claimId = '12345';
const propertyName = 'caseProgression';

const claimWithRole = (caseRole: CaseRole): Claim => {
  const claim = new Claim();
  claim.caseRole = caseRole;
  claim.applicant1 = new Party();
  return claim;
};

describe('Cancel request for reconsideration', () => {
  const getHandler = getRouteHandler(cancelRequestForReconsiderationController, 'get', REQUEST_FOR_RECONSIDERATION_CANCEL_URL);

  beforeEach(() => {
    jest.clearAllMocks();
    mockDeleteField.mockResolvedValue(undefined);
  });

  it('deletes the draft field and redirects a claimant to the claimant dashboard', async () => {
    const claim = claimWithRole(CaseRole.CLAIMANT);
    mockGetClaimById.mockResolvedValue(claim);
    const res = createMockResponse();
    const req = {params: {id: claimId, propertyName}, session: {user: {id: 'user-1'}}} as unknown as AppRequest;

    await getHandler(req, res as unknown as Response, jest.fn());

    expect(mockDeleteField).toHaveBeenCalledWith('redis-key', claim, propertyName, 'user-1');
    expect(generateRedisKey).toHaveBeenCalledWith(req);
    expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL));
  });

  it('redirects a defendant to the defendant summary', async () => {
    mockGetClaimById.mockResolvedValue(claimWithRole(CaseRole.DEFENDANT));
    const res = createMockResponse();

    await getHandler(
      {params: {id: claimId, propertyName}, session: {user: {}}} as unknown as AppRequest,
      res as unknown as Response,
      jest.fn(),
    );

    expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL));
  });

  it('calls next when the claim cannot be loaded', async () => {
    const error = new Error('redis failure');
    mockGetClaimById.mockRejectedValue(error);
    const next = jest.fn();

    await getHandler(
      {params: {id: claimId, propertyName}, session: {user: {}}} as unknown as AppRequest,
      createMockResponse() as unknown as Response,
      next,
    );

    expect(next).toHaveBeenCalledWith(error);
  });
});
