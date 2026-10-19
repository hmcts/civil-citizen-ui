import {Response} from 'express';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseRole} from 'form/models/caseRoles';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getRequestForReconsiderationCommentsConfirmationContent} from 'services/features/caseProgression/requestForReconsideration/requestForReviewCommentsContent';
import requestForReconsiderationCommentsConfirmationController from 'routes/features/caseProgression/requestForReconsideration/commentsConfirmationController';
import {
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  REQUEST_FOR_RECONSIDERATION_COMMENTS_CONFIRMATION_URL,
} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {retrieveClaimDetails: jest.fn()};
  return {CivilServiceClient: jest.fn(() => methods)};
});

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  retrieveClaimDetails: jest.Mock;
};

const claimId = '1645882162449409';
const viewPath = 'features/caseProgression/requestForReconsideration/comments-confirmation.njk';

const claimWithRole = (caseRole: CaseRole): Claim => {
  const claim = new Claim();
  claim.id = claimId;
  claim.caseRole = caseRole;
  claim.totalClaimAmount = 1000;
  claim.applicant1 = new Party();
  return claim;
};

describe('Request for reconsideration comments confirmation', () => {
  const getHandler = getRouteHandler(
    requestForReconsiderationCommentsConfirmationController,
    'get',
    REQUEST_FOR_RECONSIDERATION_COMMENTS_CONFIRMATION_URL,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the defendant confirmation page', async () => {
    const claim = claimWithRole(CaseRole.DEFENDANT);
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);
    const dashboardUrl = constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL);
    const res = createMockResponse();
    const req = {params: {id: claimId}, query: {lang: 'en'}, cookies: {}} as unknown as AppRequest;

    await getHandler(req, res as unknown as Response, jest.fn());

    expect(civilServiceMethods.retrieveClaimDetails).toHaveBeenCalledWith(claimId, req);
    expect(res.render).toHaveBeenCalledWith(viewPath, {
      confirmationContents: getRequestForReconsiderationCommentsConfirmationContent(claim, 'en', dashboardUrl),
      noCrumbs: true,
    });
  });

  it('renders the claimant dashboard link', async () => {
    const claim = claimWithRole(CaseRole.CLAIMANT);
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);
    const res = createMockResponse();

    await getHandler(
      {params: {id: claimId}, query: {}, cookies: {lang: 'cy'}} as unknown as AppRequest,
      res as unknown as Response,
      jest.fn(),
    );

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      confirmationContents: getRequestForReconsiderationCommentsConfirmationContent(
        claim,
        'cy',
        constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
      ),
    }));
  });

  it('calls next when the claim cannot be loaded', async () => {
    const error = new Error('not found');
    civilServiceMethods.retrieveClaimDetails.mockRejectedValue(error);
    const next = jest.fn();

    await getHandler(
      {params: {id: claimId}, query: {}, cookies: {}} as unknown as AppRequest,
      createMockResponse() as unknown as Response,
      next,
    );

    expect(next).toHaveBeenCalledWith(error);
  });
});
