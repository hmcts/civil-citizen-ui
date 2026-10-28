import {Response} from 'express';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseDocument} from 'common/models/document/caseDocument';
import {Claim} from 'common/models/claim';
import {GeneralApplication} from 'common/models/generalApplication/GeneralApplication';
import {UploadAdditionalDocument} from 'common/models/generalApplication/UploadAdditionalDocument';
import {FILE_UPLOAD_SOURCE} from 'common/utils/fileUploadUtils';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {
  GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL,
  GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL,
} from 'routes/urls';
import {getSummaryList} from 'services/features/generalApplication/additionalDocumentService';
import uploadAdditionalDocumentsController from '../../../../../../../main/routes/features/generalApplication/additionalDocuments/uploadAdditionalDocumentsController';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  getDraftGARespondentResponse: jest.fn(),
  saveDraftGARespondentResponse: jest.fn(),
}));
jest.mock('services/features/generalApplication/additionalDocumentService', () => {
  const actual = jest.requireActual('services/features/generalApplication/additionalDocumentService');
  return {
    ...actual,
    getSummaryList: jest.fn((...args: unknown[]) => actual.getSummaryList(...args)),
  };
});

const uploadedFile = {
  fieldname: 'selectedFile',
  originalname: 'test.txt',
  mimetype: 'text/plain',
  size: Buffer.from('Test file content').length,
  buffer: Buffer.from('Test file content'),
};

describe('uploadAdditionalDocumentsController', () => {
  const getHandler = getRouteHandler(uploadAdditionalDocumentsController, 'get');
  const postHandler = getRouteHandler(uploadAdditionalDocumentsController, 'post');
  const viewPath = 'features/generalApplication/additionalDocuments/upload-additional-documents';
  const claimId = '12345';
  const appId = 'GA-1001';
  const currentUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL);
  const mockGetClaimById = getClaimById as jest.Mock;
  const uploadDocument = jest.spyOn(CivilServiceClient.prototype, 'uploadDocument');
  let claim: Claim;
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

  const documentOnClaim = (): void => {
    const additionalDocument = new UploadAdditionalDocument();
    additionalDocument.typeOfDocument = 'Witness statement';
    additionalDocument.caseDocument = {documentName: 'test.txt'} as CaseDocument;
    claim.generalApplication.uploadAdditionalDocuments = [additionalDocument];
  };

  beforeEach(() => {
    jest.clearAllMocks();
    claim = new Claim();
    claim.generalApplication = new GeneralApplication();
    req = {
      params: {id: claimId, appId},
      body: {},
      query: {},
      cookies: {},
      session: {save: jest.fn((callback: () => void) => callback())},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetClaimById.mockResolvedValue(claim);
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (draftStoreService.saveDraftClaim as jest.Mock).mockResolvedValue(undefined);
    uploadDocument.mockResolvedValue({documentName: 'test.txt'} as CaseDocument);
  });

  afterAll(() => {
    uploadDocument.mockRestore();
  });

  describe('on GET', () => {
    it('should render the upload page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        cancelUrl: '/case/12345/generalApplication/cancel',
      }));
      expect(getSummaryList).toHaveBeenCalledWith([], claimId, appId, undefined);
      expect(next).not.toHaveBeenCalled();
    });

    it('should pass the welsh language into the summary', async () => {
      req.query = {lang: 'cy'};

      await getHandler(req as never, res as unknown as Response, next);

      expect(getSummaryList).toHaveBeenCalledWith([], claimId, appId, 'cy');
    });

    it('should remove the selected document and redirect', async () => {
      documentOnClaim();
      req.query = {indexId: '1'};

      await getHandler(req as never, res as unknown as Response, next);

      expect(claim.generalApplication.uploadAdditionalDocuments).toHaveLength(0);
      expect(res.redirect).toHaveBeenCalledWith(currentUrl);
    });

    it('should render file upload errors stored in the session', async () => {
      req.session.fileUpload = JSON.stringify([{property: 'fileUpload', constraints: {isNotEmpty: 'ERRORS.VALID_CHOOSE_THE_FILE'}}]);
      req.session.fileUploadSource = FILE_UPLOAD_SOURCE.GA_ADDITIONAL_DOCUMENTS;

      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.any(Object));
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
    it('should upload the selected file and redirect back', async () => {
      req.body = {action: 'uploadButton', typeOfDocument: 'Witness statement'};
      req.file = uploadedFile;

      await postHandler(req as never, res as unknown as Response, next);

      expect(uploadDocument).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(currentUrl);
      expect(next).not.toHaveBeenCalled();
    });

    it('should redirect back when the upload button is used without a file', async () => {
      req.body = {action: 'uploadButton'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(uploadDocument).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(currentUrl);
      expect(req.session.fileUpload).toBeDefined();
    });

    it('should redirect back when multer reports a file error', async () => {
      req.body = {action: 'uploadButton'};
      req.multerError = {code: 'LIMIT_FILE_SIZE'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(uploadDocument).not.toHaveBeenCalled();
      expect(req.session.save).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(currentUrl);
    });

    it('should redirect to check your answers when documents are already uploaded', async () => {
      documentOnClaim();

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL),
      );
    });

    it('should redirect back when continue is used with no documents', async () => {
      claim.generalApplication.uploadAdditionalDocuments = [];

      await postHandler(req as never, res as unknown as Response, next);

      expect(req.session.fileUploadSource).toBe(FILE_UPLOAD_SOURCE.GA_ADDITIONAL_DOCUMENTS);
      expect(res.redirect).toHaveBeenCalledWith(currentUrl);
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetClaimById.mockRejectedValue(error);
      req.body = {action: 'uploadButton'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
