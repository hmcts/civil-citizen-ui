import {Response} from 'express';
import {CaseRole} from 'form/models/caseRoles';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import requestForReviewCommentsController from 'routes/features/caseProgression/requestForReconsideration/requestForReviewCommentsController';
import {REQUEST_FOR_RECONSIDERATION_COMMENTS_CYA_URL, REQUEST_FOR_RECONSIDERATION_COMMENTS_URL} from 'routes/urls';
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

describe('Request for Review Comments', () => {
  const getHandler = getRouteHandler(requestForReviewCommentsController, 'get', REQUEST_FOR_RECONSIDERATION_COMMENTS_URL);
  const postHandler = getRouteHandler(requestForReviewCommentsController, 'post', REQUEST_FOR_RECONSIDERATION_COMMENTS_URL);

  beforeEach(() => {
    jest.clearAllMocks();
    mockSaveCaseProgression.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('renders the comments page', async () => {
      mockGetClaimById.mockResolvedValue(claimWithRole(CaseRole.DEFENDANT));
      const res = createMockResponse();

      await getHandler(
        {params: {id: claimId}} as unknown as AppRequest,
        res as unknown as Response,
        jest.fn(),
      );

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
        pageTitle: 'PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW_COMMENTS.MICRO_TEXT',
        requestForReviewContents: expect.anything(),
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
    it('re-renders when the comments are empty', async () => {
      mockGetClaimById.mockResolvedValue(claimWithRole(CaseRole.DEFENDANT));
      const res = createMockResponse();

      await postHandler(
        {params: {id: claimId}, body: {textArea: ''}} as unknown as AppRequest,
        res as unknown as Response,
        jest.fn(),
      );

      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveCaseProgression).not.toHaveBeenCalled();
    });

    it('saves the comments and redirects to check your answers', async () => {
      mockGetClaimById.mockResolvedValue(claimWithRole(CaseRole.DEFENDANT));
      const res = createMockResponse();
      const req = {params: {id: claimId}, body: {textArea: 'Comments added'}} as unknown as AppRequest;

      await postHandler(req, res as unknown as Response, jest.fn());

      expect(mockSaveCaseProgression).toHaveBeenCalledWith(
        req,
        expect.objectContaining({textArea: 'Comments added'}),
        'requestForReviewDefendant',
      );
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, REQUEST_FOR_RECONSIDERATION_COMMENTS_CYA_URL));
    });
  });
});
