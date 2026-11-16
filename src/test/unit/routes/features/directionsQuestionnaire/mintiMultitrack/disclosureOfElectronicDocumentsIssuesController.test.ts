import {Response} from 'express';
import disclosureOfElectronicDocumentsIssuesController from '../../../../../../main/routes/features/directionsQuestionnaire/mintiMultitrack/disclosureOfElectronicDocumentsIssuesController';
import {
  DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL,
  DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL,
} from 'routes/urls';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {
  DisclosureOfDocuments,
  TypeOfDisclosureDocument,
} from 'models/directionsQuestionnaire/hearing/disclosureOfDocuments';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

describe('Disclosure Of Electronic Documents Issues Controller', () => {
  const getHandler = getRouteHandler(disclosureOfElectronicDocumentsIssuesController, 'get');
  const postHandler = getRouteHandler(disclosureOfElectronicDocumentsIssuesController, 'post');
  const viewPath = 'features/directionsQuestionnaire/mintiMultiTrack/disclosure-of-electronic-documents-issues';
  const claimId = '12345';
  let req: {params: {id: string}; body: Record<string, unknown>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

  const buildClaim = (documentTypes: TypeOfDisclosureDocument[] = []): Claim => {
    const claim = new Claim();
    claim.applicant1 = new Party();
    claim.respondent1 = new Party();
    claim.directionQuestionnaire = new DirectionQuestionnaire();
    claim.directionQuestionnaire.hearing = new Hearing();
    claim.directionQuestionnaire.hearing.disclosureOfDocuments = new DisclosureOfDocuments(documentTypes);
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
    it('should render the electronic documents issues page', async () => {
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
    it('should re-render when the issues text is missing', async () => {
      await postHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should redirect to documents to be considered when non-electronic documents were not chosen', async () => {
      mockGetCaseData.mockResolvedValue(buildClaim([TypeOfDisclosureDocument.ELECTRONIC]));
      req.body = {disclosureOfElectronicDocumentsIssues: 'test'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL),
      );
    });

    it('should redirect to non-electronic documents when that option was chosen', async () => {
      mockGetCaseData.mockResolvedValue(buildClaim([
        TypeOfDisclosureDocument.ELECTRONIC,
        TypeOfDisclosureDocument.NON_ELECTRONIC,
      ]));
      req.body = {disclosureOfElectronicDocumentsIssues: 'test'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL),
      );
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockSaveDraftClaim.mockRejectedValue(error);
      req.body = {disclosureOfElectronicDocumentsIssues: 'test'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
