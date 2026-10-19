import {Response} from 'express';
import viewApplicationController from '../../../../../../main/routes/features/generalApplication/viewApplicationController';
import {
  GA_APPLICATION_SUMMARY_URL,
  GA_APPLY_HELP_WITH_FEE_SELECTION,
  GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL,
  UPLOAD_YOUR_DOCUMENTS_URL,
} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {CaseState} from 'form/models/claimDetails';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {ApplicationState} from 'models/generalApplication/applicationSummary';
import {DocumentInformation, DocumentLinkInformation, DocumentsViewComponent} from 'form/models/documents/DocumentsViewComponent';
import mockApplication from '../../../../../utils/mocks/applicationMock.json';
import {constructResponseUrlWithIdAndAppIdParams, constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as generalApplicationService from 'services/features/generalApplication/generalApplicationService';
import {
  getApplicantDocuments,
  getApplicationSections,
  getCourtDocuments,
  getRespondentDocuments,
  getResponseFromCourtSection,
  getStatusRow,
  getSummaryCardSections,
} from 'services/features/generalApplication/viewApplication/viewApplicationService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  getDraftGARespondentResponse: jest.fn(),
  saveDraftGARespondentResponse: jest.fn(),
}));
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('services/features/generalApplication/viewApplication/viewApplicationService');

describe('General Application - View application', () => {
  const getHandler = getRouteHandler(viewApplicationController, 'get');
  const viewPath = 'features/generalApplication/view-applications';
  const claimId = '12345';
  const appId = '345';
  const pageTitle = 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.PAGE_TITLE';
  let claim: Claim;
  let application: ApplicationResponse;
  let req: {
    params: {id: string; appId: string};
    body: Record<string, unknown>;
    query: Record<string, unknown>;
    cookies: Record<string, unknown>;
    session: {user: {id: string}};
  };
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
  const mockDeleteDraftClaim = draftStoreService.deleteDraftClaimFromStore as jest.Mock;
  const mockGetClaim = getClaimById as jest.Mock;
  const mockSummaryRows = getApplicationSections as jest.Mock;
  const mockRespondentDocs = getRespondentDocuments as jest.Mock;
  const mockApplicantDocs = getApplicantDocuments as jest.Mock;
  const mockCourtDocs = getCourtDocuments as jest.Mock;
  const mockResponseFromCourt = getResponseFromCourtSection as jest.Mock;
  const mockStatusRow = getStatusRow as jest.Mock;
  const mockSummaryCards = getSummaryCardSections as jest.Mock;

  const orderDocument = new DocumentInformation(
    'Document',
    '1 August 2024',
    new DocumentLinkInformation('/case/1718105701451856/view-documents/4feaa073-c310-4096-979d-cd5b12ebddf8', '000MC039-settlement-agreement.pdf'),
  );
  const applicantDocuments = new DocumentsViewComponent('ApplicantDocuments', [orderDocument]);
  const courtDocuments = new DocumentsViewComponent('courtDocuments', [orderDocument]);
  const respondentDocuments = new DocumentsViewComponent('RespondentDocuments', [orderDocument]);
  const responseFromCourt = [{rows: []}];

  const buildClaim = (): Claim => {
    const builtClaim = new Claim();
    builtClaim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    return builtClaim;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    claim = buildClaim();
    application = Object.assign(new ApplicationResponse(), mockApplication);
    application.state = ApplicationState.AWAITING_APPLICATION_PAYMENT;
    req = {
      params: {id: claimId, appId},
      body: {},
      query: {index: '1'},
      cookies: {},
      session: {user: {id: 'u1'}},
    };
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (draftStoreService.generateRedisKeyForGA as jest.Mock).mockReturnValue('ga-12345');
    mockGetCaseData.mockResolvedValue(claim);
    mockSaveDraftClaim.mockResolvedValue(undefined);
    mockDeleteDraftClaim.mockResolvedValue(undefined);
    mockGetClaim.mockResolvedValue(claim);
    mockSummaryRows.mockResolvedValue({summaryRows: [], responseSummaries: []});
    mockStatusRow.mockReturnValue([]);
    mockSummaryCards.mockReturnValue([]);
    mockApplicantDocs.mockReturnValue(applicantDocuments);
    mockCourtDocs.mockReturnValue(courtDocuments);
    mockRespondentDocs.mockReturnValue(respondentDocuments);
    mockResponseFromCourt.mockResolvedValue(responseFromCourt);
    jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValue(application);
    jest.spyOn(generalApplicationService, 'getApplicationIndex').mockResolvedValue(2);
  });

  describe('on GET', () => {
    it('should render the view application page with documents, the court response and the unpaid fee link', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        applicationIndex: 1,
        backLinkUrl: constructResponseUrlWithIdParams(claimId, GA_APPLICATION_SUMMARY_URL),
        applicantDocuments,
        courtDocuments,
        respondentDocuments,
        responseFromCourt,
        isApplicationFeeAmountNotPaid: true,
        applicationFeeOptionUrl: expect.stringContaining(
          constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_APPLY_HELP_WITH_FEE_SELECTION),
        ),
        additionalDocUrl: null,
      }));
      expect(mockDeleteDraftClaim).toHaveBeenCalledWith(claimId);
      expect(next).not.toHaveBeenCalled();
    });

    it('should use the application index from the service when the query index is missing', async () => {
      req.query = {};

      await getHandler(req as never, res as unknown as Response, next);

      expect(generalApplicationService.getApplicationIndex).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        applicationIndex: 2,
      }));
    });

    it('should include the additional documents link when more documents can be uploaded', async () => {
      application.state = ApplicationState.AWAITING_RESPONDENT_RESPONSE;

      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        isApplicationFeeAmountNotPaid: false,
        additionalDocUrl: constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL),
      }));
    });

    it('should include the trial document upload link when the claim is in case progression', async () => {
      claim.ccdState = CaseState.CASE_PROGRESSION;

      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        caseProgressionCaseState: true,
        uploadDocsTrialUrl: constructResponseUrlWithIdParams(claimId, UPLOAD_YOUR_DOCUMENTS_URL),
      }));
    });

    it('should call next when loading the application fails', async () => {
      const error = new Error('redis failure');
      mockSummaryRows.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
