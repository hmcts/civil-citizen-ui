import {Response} from 'express';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseRole} from 'form/models/caseRoles';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {AppRequest} from 'models/AppRequest';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {getHearingContent} from 'services/features/caseProgression/hearing/hearingService';
import viewTheHearingController from 'routes/features/caseProgression/viewTheHearingController';
import {
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  VIEW_ORDERS_AND_NOTICES_URL,
  VIEW_THE_HEARING_URL,
} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {retrieveClaimDetails: jest.fn()};
  return {CivilServiceClient: jest.fn(() => methods)};
});

jest.mock('services/features/caseProgression/hearing/hearingService', () => ({
  getHearingContent: jest.fn(),
}));

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  retrieveClaimDetails: jest.Mock;
};
const mockGetHearingContent = getHearingContent as jest.Mock;

const claimId = '1645882162449409';
const hearingSections = [{section: 'hearing'}];

const claimWithRole = (caseRole: CaseRole): Claim => {
  const claim = new Claim();
  claim.id = claimId;
  claim.caseRole = caseRole;
  claim.totalClaimAmount = 12000;
  claim.applicant1 = new Party();
  return claim;
};

describe('View the hearing Controller', () => {
  const getHandler = getRouteHandler(viewTheHearingController, 'get', VIEW_THE_HEARING_URL);
  const viewPath = 'features/caseProgression/view-the-hearing';

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetHearingContent.mockReturnValue(hearingSections);
  });

  it('renders the claimant hearing page', async () => {
    const claim = claimWithRole(CaseRole.CLAIMANT);
    const dashboardUrl = DASHBOARD_CLAIMANT_URL.replace(':id', claimId);
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);
    const res = createMockResponse();

    await getHandler(
      {params: {id: claimId}, query: {}, cookies: {lang: 'en'}} as unknown as AppRequest,
      res as unknown as Response,
      jest.fn(),
    );

    expect(mockGetHearingContent).toHaveBeenCalledWith(claimId, claim, 'en', dashboardUrl);
    expect(res.render).toHaveBeenCalledWith(viewPath, {
      hearingSections,
      pageCaption: 'PAGES.DASHBOARD.HEARINGS.HEARING',
      pageTitle: 'PAGES.DASHBOARD.HEARINGS.VIEW_THE_HEARING',
      link: VIEW_ORDERS_AND_NOTICES_URL.replace(':id', claimId),
      claimId: caseNumberPrettify(claimId),
      claimAmount: claim.totalClaimAmount,
      dashboardUrl,
    });
  });

  it('renders the defendant hearing page', async () => {
    const claim = claimWithRole(CaseRole.DEFENDANT);
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);
    const res = createMockResponse();

    await getHandler(
      {params: {id: claimId}, query: {}, cookies: {}} as unknown as AppRequest,
      res as unknown as Response,
      jest.fn(),
    );

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      dashboardUrl: DEFENDANT_SUMMARY_URL.replace(':id', claimId),
      hearingSections,
    }));
  });
});
