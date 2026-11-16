import {Response} from 'express';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseRole} from 'form/models/caseRoles';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {AppRequest} from 'models/AppRequest';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {getJudgementContent} from 'services/features/caseProgression/judgement/judgementService';
import viewTheJudgementController from 'routes/features/caseProgression/viewTheJudgementController';
import {
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  VIEW_ORDERS_AND_NOTICES_URL,
  VIEW_THE_JUDGMENT_URL,
} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {retrieveClaimDetails: jest.fn()};
  return {CivilServiceClient: jest.fn(() => methods)};
});

jest.mock('services/features/caseProgression/judgement/judgementService', () => ({
  getJudgementContent: jest.fn(),
}));

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  retrieveClaimDetails: jest.Mock;
};
const mockGetJudgementContent = getJudgementContent as jest.Mock;

const claimId = '1645882162449409';
const judgementSections = [{section: 'judgment'}];

const claimWithRole = (caseRole: CaseRole): Claim => {
  const claim = new Claim();
  claim.id = claimId;
  claim.caseRole = caseRole;
  claim.totalClaimAmount = 12000;
  claim.applicant1 = new Party();
  return claim;
};

describe('View the judgement Controller', () => {
  const getHandler = getRouteHandler(viewTheJudgementController, 'get', VIEW_THE_JUDGMENT_URL);
  const viewPath = 'features/caseProgression/view-the-judgement';

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetJudgementContent.mockReturnValue(judgementSections);
  });

  it('renders the claimant judgment page', async () => {
    const claim = claimWithRole(CaseRole.CLAIMANT);
    const dashboardUrl = DASHBOARD_CLAIMANT_URL.replace(':id', claimId);
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);
    const res = createMockResponse();

    await getHandler(
      {params: {id: claimId}, query: {}, cookies: {lang: 'en'}} as unknown as AppRequest,
      res as unknown as Response,
      jest.fn(),
    );

    expect(mockGetJudgementContent).toHaveBeenCalledWith(claimId, claim, 'en', dashboardUrl);
    expect(res.render).toHaveBeenCalledWith(viewPath, {
      judgementSections,
      pageCaption: 'PAGES.DASHBOARD.JUDGMENTS.THE_JUDGMENT',
      pageTitle: 'PAGES.DASHBOARD.JUDGMENTS.VIEW_THE_JUDGMENT',
      link: VIEW_ORDERS_AND_NOTICES_URL.replace(':id', claimId),
      claimId: caseNumberPrettify(claimId),
      claimAmount: claim.totalClaimAmount,
      dashboardUrl,
    });
  });

  it('renders the defendant judgment page', async () => {
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
      judgementSections,
    }));
  });
});
