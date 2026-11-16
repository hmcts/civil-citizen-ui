import {Response} from 'express';
import {CaseRole} from 'form/models/caseRoles';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import requestForReviewController from 'routes/features/caseProgression/requestForReconsideration/requestForReviewController';
import {REQUEST_FOR_RECONSIDERATION_CYA_URL, REQUEST_FOR_RECONSIDERATION_URL} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

jest.mock('services/features/caseProgression/caseProgressionService', () => ({
  saveCaseProgression: jest.fn(),
}));

const mockGetClaimById = getClaimById as jest.Mock;
const mockSaveCaseProgression = saveCaseProgression as jest.Mock;

const claimId = '1645882162449409';
const viewPath = 'features/caseProgression/requestForReconsideration/request-for-review.njk';

const claimWithRole = (caseRole: CaseRole): Claim => {
  const claim = new Claim();
  claim.caseRole = caseRole;
  claim.totalClaimAmount = 1000;
  claim.applicant1 = new Party();
  return claim;
};

describe('Request for Review', () => {
  const getHandler = getRouteHandler(requestForReviewController, 'get', REQUEST_FOR_RECONSIDERATION_URL);
  const postHandler = getRouteHandler(requestForReviewController, 'post', REQUEST_FOR_RECONSIDERATION_URL);

  beforeEach(() => {
    jest.clearAllMocks();
    mockSaveCaseProgression.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('renders the review page for a defendant', async () => {
      mockGetClaimById.mockResolvedValue(claimWithRole(CaseRole.DEFENDANT));
      const res = createMockResponse();

      await getHandler(
        {params: {id: claimId}} as unknown as AppRequest,
        res as unknown as Response,
        jest.fn(),
      );

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
        pageTitle: 'PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW.MICRO_TEXT',
        requestForReviewContents: expect.anything(),
        buttonContents: expect.anything(),
      }));
    });

    it('calls next when the claim cannot be loaded', async () => {
      const error = new Error('redis failure');
      mockGetClaimById.mockRejectedValue(error);
      const next = jest.fn();

      await getHandler(
        {params: {id: claimId}} as unknown as AppRequest,
        createMockResponse() as unknown as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('saves the requested changes and redirects to check your answers', async () => {
      mockGetClaimById.mockResolvedValue(claimWithRole(CaseRole.DEFENDANT));
      const res = createMockResponse();
      const req = {params: {id: claimId}, body: {textArea: 'Changes requested'}} as unknown as AppRequest;

      await postHandler(req, res as unknown as Response, jest.fn());

      expect(mockSaveCaseProgression).toHaveBeenCalledWith(
        req,
        expect.objectContaining({textArea: 'Changes requested'}),
        'requestForReviewDefendant',
      );
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, REQUEST_FOR_RECONSIDERATION_CYA_URL));
    });

    it('saves an empty comment when the text area is missing', async () => {
      mockGetClaimById.mockResolvedValue(claimWithRole(CaseRole.CLAIMANT));
      const res = createMockResponse();
      const req = {params: {id: claimId}, body: {}} as unknown as AppRequest;

      await postHandler(req, res as unknown as Response, jest.fn());

      expect(mockSaveCaseProgression).toHaveBeenCalledWith(
        req,
        expect.objectContaining({textArea: ''}),
        'requestForReviewClaimant',
      );
    });
  });
});
