import {Response} from 'express';
import {CaseRole} from 'form/models/caseRoles';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {isCuiGaNroEnabled} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {getClaimById} from 'modules/utilityService';
import {getUploadYourDocumentsContents} from 'services/features/caseProgression/uploadYourDocumentsContents';
import uploadYourDocumentsController from 'routes/features/caseProgression/uploadYourDocumentsController';
import {DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL, UPLOAD_YOUR_DOCUMENTS_URL} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient', () => ({
  isCuiGaNroEnabled: jest.fn(),
}));

const mockGetClaimById = getClaimById as jest.Mock;
const mockIsCuiGaNroEnabled = isCuiGaNroEnabled as jest.Mock;

const claimId = '1645882162449409';
const viewPath = 'features/caseProgression/upload-your-documents';

const claimWithRole = (caseRole: CaseRole): Claim => {
  const claim = new Claim();
  claim.caseRole = caseRole;
  claim.totalClaimAmount = 1000;
  claim.applicant1 = new Party();
  return claim;
};

describe('upload your documents page', () => {
  const getHandler = getRouteHandler(uploadYourDocumentsController, 'get', UPLOAD_YOUR_DOCUMENTS_URL);

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsCuiGaNroEnabled.mockResolvedValue(false);
  });

  it('renders the page for a claimant', async () => {
    const claim = claimWithRole(CaseRole.CLAIMANT);
    mockGetClaimById.mockResolvedValue(claim);
    const res = createMockResponse();
    const req = {params: {id: claimId}} as unknown as AppRequest;

    await getHandler(req, res as unknown as Response, jest.fn());

    expect(mockGetClaimById).toHaveBeenCalledWith(claimId, req, true);
    expect(res.render).toHaveBeenCalledWith(viewPath, {
      uploadYourDocumentsContents: getUploadYourDocumentsContents(claimId, claim, false),
      dashboardUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
    });
  });

  it('renders the page for a defendant', async () => {
    const claim = claimWithRole(CaseRole.DEFENDANT);
    mockGetClaimById.mockResolvedValue(claim);
    const res = createMockResponse();

    await getHandler(
      {params: {id: claimId}} as unknown as AppRequest,
      res as unknown as Response,
      jest.fn(),
    );

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      dashboardUrl: constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL),
    }));
  });

  it('calls next when the claim cannot be loaded', async () => {
    const error = new Error('claim not found');
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
