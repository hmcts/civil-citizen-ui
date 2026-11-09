import {Response} from 'express';
import documentsConsideredDetailsController from '../../../../../../main/routes/features/directionsQuestionnaire/mintiMultitrack/documentsConsideredDetailsController';
import {DQ_DEFENDANT_EXPERT_EVIDENCE_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {CaseRole} from 'form/models/caseRoles';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

describe('Claimant documents considered details controller', () => {
  const getHandler = getRouteHandler(documentsConsideredDetailsController, 'get');
  const postHandler = getRouteHandler(documentsConsideredDetailsController, 'post');
  const viewPath = 'features/directionsQuestionnaire/mintiMultiTrack/claimant-documents-considered-details';
  const claimId = '12345';
  let req: {params: {id: string}; body: Record<string, unknown>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

  const buildClaim = (caseRole = CaseRole.DEFENDANT): Claim => {
    const claim = new Claim();
    claim.caseRole = caseRole;
    claim.applicant1 = new Party();
    claim.respondent1 = new Party();
    return claim;
  };

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}};
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    mockGetCaseData.mockResolvedValue(buildClaim());
    mockSaveDraftClaim.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the claimant documents considered details page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.DOCUMENTS_CONSIDERED_DETAILS.PAGE_TITLE_WITH_CLAIMANT',
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should render the defendant documents title when the user is the claimant', async () => {
      mockGetCaseData.mockResolvedValue(buildClaim(CaseRole.CLAIMANT));

      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.DOCUMENTS_CONSIDERED_DETAILS.PAGE_TITLE_WITH_DEFENDANT',
      }));
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when the details are missing', async () => {
      await postHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.DOCUMENTS_CONSIDERED_DETAILS.PAGE_TITLE_WITH_CLAIMANT',
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should save and redirect to expert evidence', async () => {
      req.body = {claimantDocumentsConsideredDetails: 'test'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, DQ_DEFENDANT_EXPERT_EVIDENCE_URL),
      );
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockSaveDraftClaim.mockRejectedValue(error);
      req.body = {claimantDocumentsConsideredDetails: 'test'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
