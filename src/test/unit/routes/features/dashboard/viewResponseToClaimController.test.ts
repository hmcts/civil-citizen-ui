import {Response} from 'express';
import viewResponseToClaimController from 'routes/features/dashboard/viewResponseToClaimController';
import {
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  VIEW_ORDERS_AND_NOTICES_URL,
  VIEW_RESPONSE_TO_CLAIM,
} from 'routes/urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {CaseRole} from 'form/models/caseRoles';
import {ResponseType} from 'form/models/responseType';
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

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  retrieveClaimDetails: jest.Mock;
};

const viewPath = 'features/dashboard/view-response-to-claim';
const claimId = '123';

const buildClaim = (responseType?: ResponseType, caseRole: CaseRole = CaseRole.CLAIMANT): Claim => {
  const claim = new Claim();
  claim.id = claimId;
  claim.caseRole = caseRole;
  claim.totalClaimAmount = 1000;
  claim.respondent1ResponseDate = new Date('2024-01-02');
  claim.respondent1 = new Party();
  claim.respondent1.responseType = responseType;
  claim.applicant1 = new Party();
  return claim;
};

const invoke = async () => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(viewResponseToClaimController, 'get', VIEW_RESPONSE_TO_CLAIM)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('View response to claim controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    [undefined, null],
    [ResponseType.PART_ADMISSION, 'PAGES.CITIZEN_RESPONSE_TYPE.ADMIT_PART'],
    [ResponseType.FULL_ADMISSION, 'PAGES.CITIZEN_RESPONSE_TYPE.ADMIT_ALL'],
    [ResponseType.FULL_DEFENCE, 'PAGES.CITIZEN_RESPONSE_TYPE.REJECT_ALL'],
    [ResponseType.COUNTER_CLAIM, 'PAGES.CITIZEN_RESPONSE_TYPE.COUNTER_CLAIM'],
  ])('should render response type %s as %s', async (responseType, expectedResponseType) => {
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(buildClaim(responseType as ResponseType | undefined));

    const {res} = await invoke();

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      pageTitle: 'PAGES.VIEW_RESPONSE_TO_THE_CLAIM.PAGE_TITLE',
      pageCaption: 'PAGES.VIEW_RESPONSE_TO_THE_CLAIM.PAGE_CAPTION',
      responseType: expectedResponseType,
      claimId: caseNumberPrettify(claimId),
      claimAmount: 1000,
      dashboardUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
      ordersAndNoticesUrl: constructResponseUrlWithIdParams(claimId, VIEW_ORDERS_AND_NOTICES_URL),
    }));
  });

  it('should point the dashboard link at the defendant summary for a defendant', async () => {
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(buildClaim(ResponseType.FULL_DEFENCE, CaseRole.DEFENDANT));

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
