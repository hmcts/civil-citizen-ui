import {Response} from 'express';
import {CaseRole} from 'form/models/caseRoles';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getClaimRequestForReconsideration} from '../../../../../utils/mockClaimForCheckAnswers';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {deleteDraftClaim} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import * as checkAnswersService from 'services/features/caseProgression/requestForReconsideration/requestForReviewService';
import requestForReconsiderationCheckAnswersController from 'routes/features/caseProgression/requestForReconsideration/checkAnswersController';
import {
  REQUEST_FOR_RECONSIDERATION_CANCEL_URL,
  REQUEST_FOR_RECONSIDERATION_CONFIRMATION_URL,
  REQUEST_FOR_RECONSIDERATION_CYA_URL,
  REQUEST_FOR_RECONSIDERATION_URL,
} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {submitRequestForReconsideration: jest.fn()};
  return {CivilServiceClient: jest.fn(() => methods)};
});

jest.mock('modules/draft-store/draftStoreService', () => ({
  deleteDraftClaim: jest.fn(),
}));

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  submitRequestForReconsideration: jest.Mock;
};
const mockGetClaimById = getClaimById as jest.Mock;
const mockDeleteDraftClaim = deleteDraftClaim as jest.Mock;

const claimId = '1692795793361508';
const viewPath = 'features/caseProgression/requestForReconsideration/check-answers';

const loadedClaim = () => {
  const claim = getClaimRequestForReconsideration();
  claim.totalClaimAmount = 1000;
  return claim;
};

describe('Request for Reconsideration check answers', () => {
  const getHandler = getRouteHandler(requestForReconsiderationCheckAnswersController, 'get', REQUEST_FOR_RECONSIDERATION_CYA_URL);
  const postHandler = getRouteHandler(requestForReconsiderationCheckAnswersController, 'post', REQUEST_FOR_RECONSIDERATION_CYA_URL);

  beforeEach(() => {
    jest.clearAllMocks();
    const claim = loadedClaim();
    mockGetClaimById.mockResolvedValue(claim);
    civilServiceMethods.submitRequestForReconsideration.mockResolvedValue(claim);
    mockDeleteDraftClaim.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('on GET', () => {
    it.each([
      {role: CaseRole.CLAIMANT, text: 'Want review'},
      {role: CaseRole.DEFENDANT, text: 'Also want review'},
    ])('renders the $role saved reasons and the editor Change link', async ({role, text}) => {
      const claim = loadedClaim();
      claim.caseRole = role;
      mockGetClaimById.mockResolvedValueOnce(claim);
      const res = createMockResponse();
      const next = jest.fn();

      await getHandler(
        {params: {id: claimId}, query: {lang: 'en'}, cookies: {}} as unknown as AppRequest,
        res as unknown as Response,
        next,
      );

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        backLinkUrl: constructResponseUrlWithIdParams(claimId, REQUEST_FOR_RECONSIDERATION_URL),
        cancelUrl: REQUEST_FOR_RECONSIDERATION_CANCEL_URL.replace(':id', claimId).replace(':propertyName', 'caseProgression'),
        summarySections: expect.objectContaining({sections: expect.any(Array)}),
        caseInfoContents: expect.any(Array),
      }));
      expect(res.render).toHaveBeenCalledTimes(1);
      expect(res.render.mock.calls[0][1].summarySections.sections[0].summaryList.rows).toEqual([
        expect.objectContaining({
          value: {html: text},
          actions: {items: [expect.objectContaining({
            href: constructResponseUrlWithIdParams(claimId, REQUEST_FOR_RECONSIDERATION_URL),
          })]},
        }),
      ]);
      expect(next).not.toHaveBeenCalled();
    });

    it('calls next when building the summary fails', async () => {
      const error = new Error('redis failure');
      jest.spyOn(checkAnswersService, 'getSummarySections').mockImplementation(() => {
        throw error;
      });
      const next = jest.fn();

      await getHandler(
        {params: {id: claimId}, query: {}, cookies: {}} as unknown as AppRequest,
        createMockResponse() as unknown as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('submits the request and redirects to confirmation', async () => {
      const res = createMockResponse();
      const req = {params: {id: claimId}} as unknown as AppRequest;

      await postHandler(req, res as unknown as Response, jest.fn());

      expect(civilServiceMethods.submitRequestForReconsideration).toHaveBeenCalledWith(claimId, expect.any(Object), req);
      expect(mockDeleteDraftClaim).toHaveBeenCalledWith(req);
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, REQUEST_FOR_RECONSIDERATION_CONFIRMATION_URL));
    });

    it('calls next when submission fails', async () => {
      const error = new Error('ccd failure');
      civilServiceMethods.submitRequestForReconsideration.mockRejectedValue(error);
      const next = jest.fn();

      await postHandler(
        {params: {id: claimId}} as unknown as AppRequest,
        createMockResponse() as unknown as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
