import {Response} from 'express';
import ordersAndNoticesController from 'routes/features/dashboard/ordersAndNoticesController';
import {DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL, VIEW_ORDERS_AND_NOTICES_URL} from 'routes/urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getClaimantDocuments, getCourtDocuments, getDefendantDocuments} from 'services/features/dashboard/ordersAndNoticesService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {CaseRole} from 'form/models/caseRoles';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {
    retrieveClaimDetails: jest.fn(),
  };
  return {CivilServiceClient: jest.fn(() => methods)};
});
jest.mock('services/features/dashboard/ordersAndNoticesService', () => ({
  getClaimantDocuments: jest.fn(),
  getDefendantDocuments: jest.fn(),
  getCourtDocuments: jest.fn(),
}));

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  retrieveClaimDetails: jest.Mock;
};

const viewPath = 'features/dashboard/orders-and-notices';
const claimId = '123';
const claimantDocuments = {role: 'claimant'};
const defendantDocuments = {role: 'defendant'};
const courtDocuments = {role: 'court'};

const buildClaim = (caseRole: CaseRole): Claim => {
  const claim = new Claim();
  claim.id = claimId;
  claim.caseRole = caseRole;
  claim.totalClaimAmount = 1000;
  claim.applicant1 = new Party();
  return claim;
};

const invoke = async (lang?: string) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(ordersAndNoticesController, 'get', VIEW_ORDERS_AND_NOTICES_URL)(
    {
      params: {id: claimId},
      body: {},
      query: lang ? {lang} : {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  await new Promise((resolve) => setImmediate(resolve));
  return {res, next};
};

describe('Orders and notices controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getClaimantDocuments as jest.Mock).mockResolvedValue(claimantDocuments);
    (getDefendantDocuments as jest.Mock).mockResolvedValue(defendantDocuments);
    (getCourtDocuments as jest.Mock).mockResolvedValue(courtDocuments);
  });

  it('should render claimant orders and notices in the requested language', async () => {
    const claim = buildClaim(CaseRole.CLAIMANT);
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);

    const {res} = await invoke('cy');

    expect(getClaimantDocuments).toHaveBeenCalledWith(claim, claimId, 'cy');
    expect(getDefendantDocuments).toHaveBeenCalledWith(claim, claimId, 'cy');
    expect(getCourtDocuments).toHaveBeenCalledWith(claim, claimId, 'cy');
    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      claimantDocuments,
      defendantDocuments,
      courtDocuments,
      pageTitle: 'PAGES.ORDERS_AND_NOTICES.PAGE_TITLE',
      pageCaption: 'PAGES.ORDERS_AND_NOTICES.PAGE_CAPTION',
      claimId: caseNumberPrettify(claimId),
      claimAmount: 1000,
      dashboardUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
    }));
  });

  it('should point the dashboard link at the defendant summary for a defendant', async () => {
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(buildClaim(CaseRole.DEFENDANT));

    const {res} = await invoke();

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      dashboardUrl: constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL),
    }));
  });

  it('should call next when claim retrieval fails', async () => {
    const error = new Error('claim retrieval failed');
    civilServiceMethods.retrieveClaimDetails.mockRejectedValue(error);

    const {next} = await invoke();

    expect(next).toHaveBeenCalledWith(error);
  });
});
