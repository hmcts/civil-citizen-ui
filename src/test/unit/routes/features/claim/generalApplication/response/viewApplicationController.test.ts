import {Response} from 'express';
import viewApplicationToRespondentController from '../../../../../../../main/routes/features/generalApplication/response/viewApplicationController';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {CaseState} from 'form/models/claimDetails';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {
  DocumentInformation,
  DocumentLinkInformation,
  DocumentsViewComponent,
} from 'form/models/documents/DocumentsViewComponent';
import {
  getApplicantDocuments,
  getApplicationSections,
  getCourtDocuments,
  getRespondentDocuments,
  getResponseFromCourtSection,
} from 'services/features/generalApplication/viewApplication/viewApplicationService';
import * as generalApplicationService from 'services/features/generalApplication/generalApplicationService';
import {getClaimById} from 'modules/utilityService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import mockApplication from '../../../../../../utils/mocks/applicationMock.json';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService');
jest.mock('services/features/generalApplication/viewApplication/viewApplicationService');
jest.mock('services/features/generalApplication/response/viewApplicationService', () => ({
  isRespondentAllowedToRespond: jest.fn().mockReturnValue(false),
}));
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  saveDraftGARespondentResponse: jest.fn(),
  getDraftGARespondentResponse: jest.fn(),
}));

describe('General Application - View application', () => {
  const getHandler = getRouteHandler(viewApplicationToRespondentController, 'get');
  const viewPath = 'features/generalApplication/response/view-application';
  const claimId = '12345';
  const appId = 'GA-1001';
  let req: {params: {id: string; appId: string}; body: Record<string, unknown>; cookies: {lang: string}; query: Record<string, unknown>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  let application: ApplicationResponse;
  const mockGetClaim = getClaimById as jest.Mock;
  const mockSections = getApplicationSections as jest.Mock;
  const mockApplicantDocs = getApplicantDocuments as jest.Mock;
  const mockCourtDocs = getCourtDocuments as jest.Mock;
  const mockRespondentDocs = getRespondentDocuments as jest.Mock;
  const mockResponseFromCourt = getResponseFromCourtSection as jest.Mock;
  let mockGetApplicationIndex: jest.SpyInstance;
  let mockGetApplication: jest.SpyInstance;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    return claim;
  };

  const orderDocument = new DocumentInformation(
    'Document',
    '1 August 2024',
    new DocumentLinkInformation('/case/1718105701451856/view-documents/4feaa073-c310-4096-979d-cd5b12ebddf8', '000MC039-settlement-agreement.pdf'),
  );

  beforeEach(() => {
    jest.clearAllMocks();
    req = {params: {id: claimId, appId}, body: {}, cookies: {lang: 'en'}, query: {}};
    res = createMockResponse();
    next = jest.fn();
    application = Object.assign(new ApplicationResponse(), mockApplication);
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (draftStoreService.generateRedisKeyForGA as jest.Mock).mockReturnValue('ga-12345');
    (draftStoreService.getCaseDataFromStore as jest.Mock).mockResolvedValue(buildClaim());
    (draftStoreService.saveDraftClaim as jest.Mock).mockResolvedValue(undefined);
    (draftStoreService.deleteDraftClaimFromStore as jest.Mock).mockResolvedValue(undefined);
    mockGetClaim.mockResolvedValue(buildClaim());
    mockGetApplication = jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValue(application);
    mockGetApplicationIndex = jest.spyOn(generalApplicationService, 'getApplicationIndex').mockResolvedValue(1);
    mockSections.mockResolvedValue({summaryRows: [], responseSummaries: []});
    mockApplicantDocs.mockReturnValue(new DocumentsViewComponent('applicant', []));
    mockCourtDocs.mockReturnValue(new DocumentsViewComponent('court', []));
    mockRespondentDocs.mockReturnValue(new DocumentsViewComponent('respondent', []));
    mockResponseFromCourt.mockResolvedValue([]);
  });

  afterEach(() => {
    mockGetApplication?.mockRestore();
    mockGetApplicationIndex?.mockRestore();
  });

  describe('on GET', () => {
    it('should render the application using the index from the service', async () => {
      const summaryRows = [{
        key: {text: 'Application type and description'},
        value: {html: 'More time to do what is required by a court order.'},
      }];
      mockSections.mockResolvedValue({summaryRows, responseSummaries: []});

      await getHandler(req as never, res as unknown as Response, next);

      expect(mockGetApplicationIndex).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        summaryRows,
        applicationIndex: 1,
        caseProgressionCaseState: false,
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should render documents and the court response for the query index', async () => {
      const applicantDocuments = new DocumentsViewComponent('ApplicantDocuments', [orderDocument]);
      const courtDocuments = new DocumentsViewComponent('courtDocuments', [orderDocument]);
      const respondentDocuments = new DocumentsViewComponent('RespondentDocuments', [orderDocument]);
      const responseFromCourt = [{rows: ['judge direction']}];
      mockApplicantDocs.mockReturnValue(applicantDocuments);
      mockCourtDocs.mockReturnValue(courtDocuments);
      mockRespondentDocs.mockReturnValue(respondentDocuments);
      mockResponseFromCourt.mockResolvedValue(responseFromCourt);
      req.query = {index: '2'};

      await getHandler(req as never, res as unknown as Response, next);

      expect(mockGetApplicationIndex).not.toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        applicationIndex: 2,
        applicantDocuments,
        courtDocuments,
        respondentDocuments,
        responseFromCourt,
      }));
    });

    it('should set the case progression flag when the claim is in case progression', async () => {
      const claim = buildClaim();
      claim.ccdState = CaseState.CASE_PROGRESSION;
      mockGetClaim.mockResolvedValue(claim);
      req.query = {index: '1'};

      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        caseProgressionCaseState: true,
      }));
    });

    it('should call next when loading the application sections fails', async () => {
      const error = new Error('redis failure');
      mockSections.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
