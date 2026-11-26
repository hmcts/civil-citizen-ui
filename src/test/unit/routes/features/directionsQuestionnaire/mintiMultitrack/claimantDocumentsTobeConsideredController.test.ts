import {Response} from 'express';
import documentsTobeConsideredController from '../../../../../../main/routes/features/directionsQuestionnaire/mintiMultitrack/documentsTobeConsideredController';
import {
  DQ_DEFENDANT_EXPERT_EVIDENCE_URL,
  DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_DETAILS_URL,
} from 'routes/urls';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {CaseRole} from 'form/models/caseRoles';
import {YesNo} from 'form/models/yesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as responseDraftStoreService from 'modules/draft-store/response/responseDraftStoreService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/draft-store/response/responseDraftStoreService');
jest.mock('app/auth/launchdarkly/launchDarklyClient', () => ({
  isDraftDefendantResponseDatabaseEnabled: jest.fn().mockResolvedValue(false),
}));

describe('claimant Documents to be considered Controller', () => {
  const getHandler = getRouteHandler(documentsTobeConsideredController, 'get');
  const postHandler = getRouteHandler(documentsTobeConsideredController, 'post');
  const viewPath = 'features/directionsQuestionnaire/mintiMultiTrack/claimant-documents-to-be-considered';
  const claimId = '12345';
  let req: {params: {id: string}; body: Record<string, unknown>; session: ReturnType<typeof createMockSession>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
  const mockGetResponseClaimById = responseDraftStoreService.getResponseClaimById as jest.Mock;
  const mockGetResponseDraft = responseDraftStoreService.getResponseDraft as jest.Mock;
  const mockUpdateResponseDraft = responseDraftStoreService.updateResponseDraft as jest.Mock;

  const buildClaim = (caseRole = CaseRole.DEFENDANT): Claim => {
    const claim = new Claim();
    claim.caseRole = caseRole;
    claim.applicant1 = new Party();
    claim.respondent1 = new Party();
    return claim;
  };

  beforeEach(() => {
    req = {
      params: {id: claimId},
      body: {},
      session: createMockSession({user: {id: 'user-1'}}),
    };
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(`${claimId}user-1`);
    mockGetCaseData.mockResolvedValue(buildClaim());
    mockGetResponseClaimById.mockResolvedValue(buildClaim());
    mockGetResponseDraft.mockResolvedValue({
      claimResponse: {case_data: buildClaim()},
      rawResponse: {draftId: 'draft-1'},
      createdAt: new Date().toISOString(),
    });
    mockUpdateResponseDraft.mockResolvedValue(undefined);
    mockSaveDraftClaim.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the claimant documents to be considered page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.DOCS_FOR_DISCLOSURE.PAGE_TITLE_WITH_CLAIMANT',
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should render the defendant documents title when the user is the claimant', async () => {
      mockGetCaseData.mockResolvedValue(buildClaim(CaseRole.CLAIMANT));

      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.DOCS_FOR_DISCLOSURE.PAGE_TITLE_WITH_DEFENDANT',
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
    it('should re-render when no option is selected', async () => {
      await postHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should redirect to the details page when yes is selected', async () => {
      req.body = {option: YesNo.YES};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockUpdateResponseDraft).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_DETAILS_URL),
      );
    });

    it('should redirect to expert evidence when no is selected', async () => {
      req.body = {option: YesNo.NO};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, DQ_DEFENDANT_EXPERT_EVIDENCE_URL),
      );
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockUpdateResponseDraft.mockRejectedValue(error);
      req.body = {option: YesNo.YES};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
