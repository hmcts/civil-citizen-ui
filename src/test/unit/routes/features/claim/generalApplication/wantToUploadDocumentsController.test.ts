import {Response} from 'express';
import wantToUploadDocumentsController from '../../../../../../main/routes/features/generalApplication/wantToUploadDocuments';
import {GA_HEARING_ARRANGEMENTS_GUIDANCE_URL, GA_UPLOAD_DOCUMENTS_URL} from 'routes/urls';
import {YesNo} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {CaseDocument} from 'models/document/caseDocument';
import {constructResponseUrlWithIdParams, constructUrlWithIndex} from 'common/utils/urlFormatter';
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

describe('General Application - Want to upload documents to support hearing', () => {
  const getHandler = getRouteHandler(wantToUploadDocumentsController, 'get');
  const postHandler = getRouteHandler(wantToUploadDocumentsController, 'post');
  const viewPath = 'features/generalApplication/want-to-upload-documents';
  const claimId = '12345';
  let claim: Claim;
  let req: {
    params: {id: string};
    body: Record<string, unknown>;
    query: Record<string, unknown>;
    cookies: Record<string, unknown>;
    session: {user: {id: string}};
  };
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
  const mockGetClaim = getClaimById as jest.Mock;

  const mockCaseDocument = {
    createdBy: 'test',
    documentLink: {document_url: 'http://test', document_binary_url: 'http://test/binary', document_filename: 'test.png'},
    documentName: 'test.text',
    documentType: null,
    documentSize: 12345,
    createdDatetime: new Date(),
  } as CaseDocument;

  const buildClaim = (): Claim => {
    const builtClaim = new Claim();
    builtClaim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    builtClaim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING));
    return builtClaim;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    claim = buildClaim();
    req = {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: {user: {id: 'u1'}},
    };
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (draftStoreService.generateRedisKeyForGA as jest.Mock).mockReturnValue('ga-12345');
    mockGetCaseData.mockResolvedValue(claim);
    mockSaveDraftClaim.mockResolvedValue(undefined);
    mockGetClaim.mockResolvedValue(claim);
  });

  describe('on GET', () => {
    it('should render the want to upload documents page', async () => {
      claim.generalApplication.applicationTypes = [new ApplicationType(ApplicationTypeOption.SET_ASIDE_JUDGEMENT)];

      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        headerTitle: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CANCEL_JUDGMENT',
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetClaim.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should save and redirect to the upload documents page when the answer is yes', async () => {
      req.body = {option: 'yes'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(
        constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_UPLOAD_DOCUMENTS_URL), 0),
      );
    });

    it('should clear uploaded documents and redirect to hearing arrangements guidance when the answer is no', async () => {
      const uploadDocument = new UploadGAFiles();
      uploadDocument.caseDocument = mockCaseDocument;
      claim.generalApplication.uploadEvidenceForApplication.push(uploadDocument);
      req.body = {option: 'no'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(claim.generalApplication.uploadEvidenceForApplication).toEqual([]);
      expect(res.redirect).toHaveBeenCalledWith(
        constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_HEARING_ARRANGEMENTS_GUIDANCE_URL), 0),
      );
    });

    it('should keep index 0 when the first application is selected in a multi-application journey', async () => {
      claim.generalApplication = new GeneralApplication();
      claim.generalApplication.applicationTypes = [
        new ApplicationType(ApplicationTypeOption.EXTEND_TIME),
        new ApplicationType(ApplicationTypeOption.STAY_THE_CLAIM),
      ];
      claim.generalApplication.uploadEvidenceForApplication = [];
      req.query = {index: '0'};
      req.body = {option: YesNo.NO};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(
        constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_HEARING_ARRANGEMENTS_GUIDANCE_URL), 0),
      );
    });

    it('should re-render when no option is selected', async () => {
      req.body = {option: null};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.anything());
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockSaveDraftClaim.mockRejectedValue(error);
      req.body = {option: YesNo.NO};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
