import {Response} from 'express';
import disclosureOfDocumentsController from '../../../../../../main/routes/features/directionsQuestionnaire/mintiMultitrack/disclosureOfDocumentsController';
import {
  DQ_MULTITRACK_AGREEMENT_REACHED_URL,
  DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL,
  DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL,
} from 'routes/urls';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {TypeOfDisclosureDocument} from 'models/directionsQuestionnaire/hearing/disclosureOfDocuments';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as responseDraftStoreService from 'modules/draft-store/response/responseDraftStoreService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/draft-store/response/responseDraftStoreService');
jest.mock('app/auth/launchdarkly/launchDarklyClient', () => ({
  isDraftDefendantResponseDatabaseEnabled: jest.fn().mockResolvedValue(false),
}));

describe('Disclosure Of Documents Controller', () => {
  const getHandler = getRouteHandler(disclosureOfDocumentsController, 'get');
  const postHandler = getRouteHandler(disclosureOfDocumentsController, 'post');
  const viewPath = 'features/directionsQuestionnaire/mintiMultiTrack/disclosure-of-documents';
  const claimId = '12345';
  let req: {params: {id: string}; body: Record<string, unknown>; session: ReturnType<typeof createMockSession>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
  const mockGetResponseClaimById = responseDraftStoreService.getResponseClaimById as jest.Mock;
  const mockGetResponseDraft = responseDraftStoreService.getResponseDraft as jest.Mock;
  const mockUpdateResponseDraft = responseDraftStoreService.updateResponseDraft as jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
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
    it('should render the disclosure of documents page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to documents to be considered when nothing is selected', async () => {
      await postHandler(req as never, res as unknown as Response, next);

      expect(mockUpdateResponseDraft).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL),
      );
    });

    it('should redirect to agreement reached when electronic documents are selected', async () => {
      req.body = {documentsTypeForm: [TypeOfDisclosureDocument.ELECTRONIC]};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, DQ_MULTITRACK_AGREEMENT_REACHED_URL),
      );
    });

    it('should redirect to non-electronic documents when only non-electronic documents are selected', async () => {
      req.body = {documentsTypeForm: [TypeOfDisclosureDocument.NON_ELECTRONIC]};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL),
      );
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockUpdateResponseDraft.mockRejectedValue(error);
      req.body = {documentsTypeForm: [TypeOfDisclosureDocument.ELECTRONIC]};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
