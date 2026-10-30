import {Response} from 'express';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseDocument} from 'common/models/document/caseDocument';
import {Claim} from 'common/models/claim';
import {GeneralApplication} from 'common/models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {UploadGAFiles} from 'common/models/generalApplication/uploadGAFiles';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {GA_UPLOAD_N245_FORM_URL, GA_WANT_TO_UPLOAD_DOCUMENTS_URL} from 'routes/urls';
import uploadN245FormController from '../../../../../../main/routes/features/generalApplication/uploadN245FormController';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('i18next', () => ({
  t: (key: string) => key,
}));
jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
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

describe('General Application - upload n245 form', () => {
  const getHandler = getRouteHandler(uploadN245FormController, 'get');
  const postHandler = getRouteHandler(uploadN245FormController, 'post');
  const viewPath = 'features/generalApplication/upload-n245-form';
  const claimId = '12345';
  const currentUrl = constructResponseUrlWithIdParams(claimId, GA_UPLOAD_N245_FORM_URL);
  const mockGetClaimById = getClaimById as jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const uploadDocument = jest.spyOn(CivilServiceClient.prototype, 'uploadDocument');
  let claim: Claim;
  let req: {
    params: {id: string};
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
    claim = new Claim();
    claim.generalApplication = new GeneralApplication();
    claim.generalApplication.applicationTypes.push(new ApplicationType(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT));
    claim.generalApplication.uploadN245Form = new UploadGAFiles();
    req = {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {lang: 'en'},
      session: {save: jest.fn((callback: () => void) => callback())},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetClaimById.mockResolvedValue(claim);
    mockGetCaseData.mockResolvedValue(claim);
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
        pageTitle: 'PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.PAGE_TITLE',
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should remove the uploaded form', async () => {
      claim.generalApplication.uploadN245Form.caseDocument = {documentName: 'test.txt'} as CaseDocument;
      req.query = {action: 'REMOVE_DOC'};

      await getHandler(req as never, res as unknown as Response, next);

      expect(claim.generalApplication.uploadN245Form).toBeUndefined();
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        documentName: undefined,
      }));
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetClaimById.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when the upload button is used without a file', async () => {
      req.body = {action: 'uploadButton'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(uploadDocument).not.toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.any(Object));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should redirect back when multer reports a file error', async () => {
      req.body = {action: 'uploadButton'};
      req.multerError = {code: 'LIMIT_FILE_SIZE'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(req.session.save).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(currentUrl);
    });

    it('should save the file and re-render its name', async () => {
      req.body = {action: 'uploadButton'};
      req.file = uploadedFile;

      await postHandler(req as never, res as unknown as Response, next);

      expect(uploadDocument).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        documentName: 'test.txt',
      }));
    });

    it('should call next when the document upload fails', async () => {
      const error = new Error('upload failure');
      uploadDocument.mockRejectedValue(error);
      req.body = {action: 'uploadButton'};
      req.file = uploadedFile;

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should re-render when continue is used without a document', async () => {
      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should redirect when a document has already been uploaded', async () => {
      claim.generalApplication.uploadN245Form.caseDocument = {documentName: 'test.txt'} as CaseDocument;

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, GA_WANT_TO_UPLOAD_DOCUMENTS_URL));
    });
  });
});
