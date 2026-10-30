import {Response} from 'express';
import respondentUploadEvidenceDocumentsController from '../../../../../../../main/routes/features/generalApplication/response/respondentUploadEvidenceDocmentsController';
import {GA_RESPONDENT_HEARING_PREFERENCE_URL, GA_RESPONDENT_UPLOAD_DOCUMENT_URL} from 'routes/urls';
import {FILE_UPLOAD_SOURCE} from 'common/utils/fileUploadUtils';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {CaseDocument} from 'models/document/caseDocument';
import {YesNo} from 'form/models/yesNo';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getClaimById} from 'modules/utilityService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as gaStoreResponseService from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService');
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  saveDraftGARespondentResponse: jest.fn(),
  getDraftGARespondentResponse: jest.fn(),
}));

describe('General Application - Respondent upload evidence documents', () => {
  const getHandler = getRouteHandler(respondentUploadEvidenceDocumentsController, 'get');
  const postHandler = getRouteHandler(respondentUploadEvidenceDocumentsController, 'post');
  const viewPath = 'features/generalApplication/response/respondent-upload-documents';
  const claimId = '12345';
  const appId = 'GA-1001';
  const currentUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPONDENT_UPLOAD_DOCUMENT_URL);
  let req: {
    params: {id: string; appId: string};
    body: Record<string, unknown>;
    cookies: {lang: string};
    query: Record<string, unknown>;
    session: {save: jest.Mock; fileUpload?: string; fileUploadSource?: string};
    file?: {fieldname: string; originalname: string; mimetype: string; size: number; buffer: Buffer};
    multerError?: {code: string};
  };
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  let gaResponse: GaResponse;
  const mockGetClaim = getClaimById as jest.Mock;
  const mockGetDraft = gaStoreResponseService.getDraftGARespondentResponse as jest.Mock;
  const mockSaveDraft = gaStoreResponseService.saveDraftGARespondentResponse as jest.Mock;

  const mockCaseDocument = {
    createdBy: 'test',
    documentLink: {document_url: 'http://test', document_binary_url: 'http://test/binary', document_filename: 'test.png'},
    documentName: 'test.text',
    documentType: null,
    documentSize: 12345,
    createdDatetime: new Date(),
  } as CaseDocument;

  const uploadedDocument = (id: string): UploadGAFiles => {
    const document = new UploadGAFiles();
    document.caseDocument = {...mockCaseDocument, documentName: `${id}.pdf`,
      documentLink: {...mockCaseDocument.documentLink, document_url: `http://dm-store/documents/${id}`}};
    return document;
  };

  const uploadedFile = {
    fieldname: 'selectedFile',
    originalname: 'evidence.txt',
    mimetype: 'text/plain',
    size: Buffer.from('Test file content').length,
    buffer: Buffer.from('Test file content'),
  };

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    return claim;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: {id: claimId, appId},
      body: {},
      cookies: {lang: 'en'},
      query: {},
      session: {save: jest.fn((callback: () => void) => callback())},
    };
    res = createMockResponse();
    next = jest.fn();
    gaResponse = new GaResponse();
    gaResponse.generalApplicationType = [ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT];
    gaResponse.wantToUploadDocuments = YesNo.YES;
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (draftStoreService.generateRedisKeyForGA as jest.Mock).mockReturnValue('ga-12345');
    (draftStoreService.getCaseDataFromStore as jest.Mock).mockResolvedValue(buildClaim());
    (draftStoreService.saveDraftClaim as jest.Mock).mockResolvedValue(undefined);
    mockGetClaim.mockResolvedValue(buildClaim());
    mockGetDraft.mockResolvedValue(gaResponse);
    mockSaveDraft.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the upload documents page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        currentUrl,
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should not remove a file on a GET request', async () => {
      gaResponse.uploadEvidenceDocuments.push(uploadedDocument('first'), uploadedDocument('second'));
      req.query = {id: '1'};

      await getHandler(req as never, res as unknown as Response, next);

      expect(gaResponse.uploadEvidenceDocuments).toHaveLength(2);
      expect(mockSaveDraft).not.toHaveBeenCalled();
      expect(res.render).toHaveBeenCalled();
    });

    it('should render session file upload errors', async () => {
      req.session.fileUpload = JSON.stringify([{
        property: 'fileUpload',
        constraints: {isAllowedMimeType: 'ERRORS.VALID_MIME_TYPE_FILE'},
      }]);
      req.session.fileUploadSource = FILE_UPLOAD_SOURCE.GA_RESPONDENT_UPLOAD;

      await getHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetClaim.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should delete the requested file from the list and from document management', async () => {
      gaResponse.uploadEvidenceDocuments.push(uploadedDocument('first'), uploadedDocument('second'));
      const deleteDocument = jest.spyOn(CivilServiceClient.prototype, 'deleteDocument').mockResolvedValue(undefined);
      req.body = {action: 'deleteFile[0][first]'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(gaResponse.uploadEvidenceDocuments.map((document: UploadGAFiles) => document.caseDocument.documentName)).toEqual(['second.pdf']);
      expect(mockSaveDraft).toHaveBeenCalled();
      expect(deleteDocument).toHaveBeenCalledTimes(1);
      expect(deleteDocument).toHaveBeenCalledWith(expect.anything(), 'first');
      expect(res.redirect).toHaveBeenCalledWith(currentUrl);
      deleteDocument.mockRestore();
    });

    it('should redirect back when upload is clicked without a file', async () => {
      req.body = {action: 'uploadButton'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(req.session.save).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(currentUrl);
    });

    it('should redirect back when multer rejects a file that is too large', async () => {
      req.body = {action: 'uploadButton'};
      req.multerError = {code: 'LIMIT_FILE_SIZE'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(req.session.fileUploadSource).toBe(FILE_UPLOAD_SOURCE.GA_RESPONDENT_UPLOAD);
      expect(req.session.save).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(currentUrl);
    });

    it('should redirect back when continue is clicked without a document', async () => {
      await postHandler(req as never, res as unknown as Response, next);

      expect(req.session.fileUploadSource).toBe(FILE_UPLOAD_SOURCE.GA_RESPONDENT_UPLOAD);
      expect(res.redirect).toHaveBeenCalledWith(currentUrl);
    });

    it('should upload the selected file and redirect back', async () => {
      const uploadDocument = jest.spyOn(CivilServiceClient.prototype, 'uploadDocument').mockResolvedValue(mockCaseDocument);
      req.body = {action: 'uploadButton'};
      req.file = uploadedFile;

      await postHandler(req as never, res as unknown as Response, next);

      expect(uploadDocument).toHaveBeenCalled();
      expect(mockSaveDraft).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(currentUrl);
    });

    it('should redirect to hearing preference when documents have already been uploaded', async () => {
      gaResponse.uploadEvidenceDocuments.push(new UploadGAFiles());

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPONDENT_HEARING_PREFERENCE_URL),
      );
    });

    it('should call next when the upload fails', async () => {
      const error = new Error('redis failure');
      jest.spyOn(CivilServiceClient.prototype, 'uploadDocument').mockRejectedValue(error);
      req.body = {action: 'uploadButton'};
      req.file = uploadedFile;

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
