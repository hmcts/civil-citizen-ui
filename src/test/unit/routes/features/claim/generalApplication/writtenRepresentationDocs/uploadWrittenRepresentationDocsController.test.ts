import {Response} from 'express';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseDocument} from 'common/models/document/caseDocument';
import {Claim} from 'common/models/claim';
import {FILE_UPLOAD_SOURCE} from 'common/utils/fileUploadUtils';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {
  getGADocumentsFromDraftStore,
  saveGADocumentsInDraftStore,
} from 'modules/draft-store/draftGADocumentService';
import {
  GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_CYA_URL,
  GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_URL,
} from 'routes/urls';
import uploadDocumentsForRequestWrittenRepresentation from '../../../../../../../main/routes/features/generalApplication/writtenRepresentationDocs/uplodWrittenRepresentationDocsController';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('modules/draft-store/draftGADocumentService', () => ({
  getGADocumentsFromDraftStore: jest.fn(),
  saveGADocumentsInDraftStore: jest.fn(),
  deleteGADocumentsFromDraftStore: jest.fn(),
}));
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  getDraftGARespondentResponse: jest.fn(),
  saveDraftGARespondentResponse: jest.fn(),
}));

const uploadedFile = {
  fieldname: 'selectedFile',
  originalname: 'test.txt',
  mimetype: 'text/plain',
  size: Buffer.from('Test file content').length,
  buffer: Buffer.from('Test file content'),
};

const uploadedDocument = (id: string) => ({
  caseDocument: {documentName: `${id}.pdf`, documentLink: {document_url: `http://dm-store/documents/${id}`}},
});

describe('General Application - uploadWrittenRepresentationDocsController', () => {
  const getHandler = getRouteHandler(uploadDocumentsForRequestWrittenRepresentation, 'get');
  const postHandler = getRouteHandler(uploadDocumentsForRequestWrittenRepresentation, 'post');
  const viewPath = 'features/generalApplication/additionalInfoUpload/upload-documents';
  const claimId = '12345';
  const appId = 'GA-1001';
  const currentUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_URL);
  const mockGetClaimById = getClaimById as jest.Mock;
  const mockGetDocuments = getGADocumentsFromDraftStore as jest.Mock;
  const uploadDocument = jest.spyOn(CivilServiceClient.prototype, 'uploadDocument');
  const deleteDocument = jest.spyOn(CivilServiceClient.prototype, 'deleteDocument');
  let req: {
    params: {id: string; appId: string};
    body: Record<string, unknown>;
    query: Record<string, unknown>;
    cookies: Record<string, unknown>;
    session: {save: jest.Mock; fileUpload?: string; fileUploadSource?: string};
    file?: typeof uploadedFile;
    multerError?: {code: string};
  };
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: {id: claimId, appId},
      body: {},
      query: {},
      cookies: {},
      session: {save: jest.fn((callback: () => void) => callback())},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetClaimById.mockResolvedValue(new Claim());
    mockGetDocuments.mockResolvedValue([]);
    (draftStoreService.generateRedisKeyForGA as jest.Mock).mockReturnValue('ga-redis-key');
    (saveGADocumentsInDraftStore as jest.Mock).mockResolvedValue(undefined);
    uploadDocument.mockResolvedValue({documentName: 'test.txt'} as CaseDocument);
    deleteDocument.mockResolvedValue(undefined);
  });

  afterAll(() => {
    uploadDocument.mockRestore();
    deleteDocument.mockRestore();
  });

  describe('on GET', () => {
    it('should render the upload page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        headerTitle: 'PAGES.GENERAL_APPLICATION.UPLOAD_MORE_INFO_DOCUMENTS.PAGE_TITLE_TO_UPLOAD',
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should not remove a document on a GET request', async () => {
      mockGetDocuments.mockResolvedValue([uploadedDocument('first'), uploadedDocument('second')]);
      req.query = {id: '2'};

      await getHandler(req as never, res as unknown as Response, next);

      expect(saveGADocumentsInDraftStore).not.toHaveBeenCalled();
      expect(deleteDocument).not.toHaveBeenCalled();
      expect(res.render).toHaveBeenCalled();
    });

    it('should render file upload errors stored in the session', async () => {
      req.session.fileUpload = JSON.stringify([{property: 'fileUpload', constraints: {isNotEmpty: 'ERRORS.VALID_CHOOSE_THE_FILE'}}]);
      req.session.fileUploadSource = FILE_UPLOAD_SOURCE.GA_WRITTEN_REPRESENTATION;

      await getHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetClaimById.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should delete the selected document from the list and from document management', async () => {
      const documents = [uploadedDocument('first'), uploadedDocument('second')];
      mockGetDocuments.mockResolvedValue(documents);
      req.body = {action: 'deleteFile[1][second]'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(saveGADocumentsInDraftStore).toHaveBeenCalledWith('ga-redis-key', [documents[0]]);
      expect(deleteDocument).toHaveBeenCalledTimes(1);
      expect(deleteDocument).toHaveBeenCalledWith(expect.anything(), 'second');
      expect(res.redirect).toHaveBeenCalledWith(currentUrl);
    });

    it('should not delete anything when the document id does not match the row', async () => {
      mockGetDocuments.mockResolvedValue([uploadedDocument('first'), uploadedDocument('second')]);
      req.body = {action: 'deleteFile[1][first]'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(saveGADocumentsInDraftStore).not.toHaveBeenCalled();
      expect(deleteDocument).not.toHaveBeenCalled();
    });

    it('should redirect back when the upload button is used without a file', async () => {
      req.body = {action: 'uploadButton'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(uploadDocument).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(currentUrl);
    });

    it('should redirect back when multer reports a file error', async () => {
      req.body = {action: 'uploadButton'};
      req.multerError = {code: 'LIMIT_FILE_SIZE'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(uploadDocument).not.toHaveBeenCalled();
      expect(req.session.save).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(currentUrl);
    });

    it('should save the file and redirect back to the upload page', async () => {
      req.body = {action: 'uploadButton'};
      req.file = uploadedFile;

      await postHandler(req as never, res as unknown as Response, next);

      expect(uploadDocument).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(currentUrl);
    });

    it('should call next when the document upload fails', async () => {
      const error = new Error('upload failure');
      uploadDocument.mockRejectedValue(error);
      req.body = {action: 'uploadButton'};
      req.file = uploadedFile;

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should redirect back when continue is used with no documents', async () => {
      req.body = {action: 'continue'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(req.session.fileUploadSource).toBe(FILE_UPLOAD_SOURCE.GA_WRITTEN_REPRESENTATION);
      expect(res.redirect).toHaveBeenCalledWith(currentUrl);
    });

    it('should redirect to check your answers when documents are uploaded', async () => {
      mockGetDocuments.mockResolvedValue([{caseDocument: {documentName: 'test.txt'}}]);
      req.body = {action: 'continue'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_CYA_URL),
      );
    });
  });
});
