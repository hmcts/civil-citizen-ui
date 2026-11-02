import {Response} from 'express';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseRole} from 'form/models/caseRoles';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {AppRequest} from 'models/AppRequest';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {getBundlesContent} from 'services/features/caseProgression/bundles/bundlesService';
import bundlesController from 'routes/features/caseProgression/bundlesController';
import {BUNDLES_URL, DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {retrieveClaimDetails: jest.fn()};
  return {CivilServiceClient: jest.fn(() => methods)};
});

jest.mock('services/features/caseProgression/bundles/bundlesService', () => ({
  getBundlesContent: jest.fn(),
}));

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  retrieveClaimDetails: jest.Mock;
};
const mockGetBundlesContent = getBundlesContent as jest.Mock;

const claimId = '1645882162449409';
const bundleSections = [{section: 'bundles'}];

const claimWithRole = (caseRole: CaseRole): Claim => {
  const claim = new Claim();
  claim.id = claimId;
  claim.caseRole = caseRole;
  claim.totalClaimAmount = 12000;
  claim.applicant1 = new Party();
  return claim;
};

describe('Bundles Controller', () => {
  const getHandler = getRouteHandler(bundlesController, 'get', BUNDLES_URL);
  const viewPath = 'features/caseProgression/bundles';

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBundlesContent.mockReturnValue(bundleSections);
  });

  it('renders the claimant bundles page', async () => {
    const claim = claimWithRole(CaseRole.CLAIMANT);
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);
    const res = createMockResponse();

    await getHandler(
      {params: {id: claimId}, query: {}, cookies: {}} as unknown as AppRequest,
      res as unknown as Response,
      jest.fn(),
    );

    expect(res.render).toHaveBeenCalledWith(viewPath, {
      bundleSections,
      pageCaption: 'PAGES.DASHBOARD.HEARINGS.HEARING',
      pageTitle: 'PAGES.DASHBOARD.HEARINGS.VIEW_BUNDLE',
      claimId: caseNumberPrettify(claimId),
      claimAmount: claim.totalClaimAmount,
      dashboardUrl: DASHBOARD_CLAIMANT_URL.replace(':id', claimId),
    });
  });

  it('renders the defendant bundles page', async () => {
    const claim = claimWithRole(CaseRole.DEFENDANT);
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);
    const res = createMockResponse();

    await getHandler(
      {params: {id: claimId}, query: {lang: 'cy'}, cookies: {}} as unknown as AppRequest,
      res as unknown as Response,
      jest.fn(),
    );

    expect(mockGetBundlesContent).toHaveBeenCalledWith(claimId, claim, 'cy');
    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      dashboardUrl: DEFENDANT_SUMMARY_URL.replace(':id', claimId),
      bundleSections,
    }));
  });
});
