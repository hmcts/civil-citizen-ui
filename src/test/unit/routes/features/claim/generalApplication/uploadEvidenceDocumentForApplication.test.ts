import {Response} from 'express';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseDocument} from 'common/models/document/caseDocument';
import {Claim} from 'common/models/claim';
import {GeneralApplication} from 'common/models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {FILE_UPLOAD_SOURCE} from 'common/utils/fileUploadUtils';
import {constructResponseUrlWithIdParams, constructUrlWithIndex} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {
  BACK_URL,
  GA_CHECK_YOUR_ANSWERS_COSC_URL,
  GA_HEARING_ARRANGEMENTS_GUIDANCE_URL,
  GA_UPLOAD_DOCUMENTS_COSC_URL,
  GA_UPLOAD_DOCUMENTS_URL,
} from 'routes/urls';
import uploadEvidenceDocumentsForApplicationController from '../../../../../../main/routes/features/generalApplication/uploadEvidenceDocumentForApplication';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

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

const uploadedDocument = (id: string) => ({
  caseDocument: {documentName: `${id}.pdf`, documentLink: {document_url: `http://dm-store/documents/${id}`}},
}) as never;

describe('General Application - upload evidence docs to support application', () => {
  const getHandler = getRouteHandler(uploadEvidenceDocumentsForApplicationController, 'get');
  const postHandler = getRouteHandler(uploadEvidenceDocumentsForApplicationController, 'post');
  const viewPath = 'features/generalApplication/upload_documents';
  const claimId = '12345';
  const mockGetClaimById = getClaimById as jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const uploadDocument = jest.spyOn(CivilServiceClient.prototype, 'uploadDocument');
  const deleteDocument = jest.spyOn(CivilServiceClient.prototype, 'deleteDocument');
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

  const pageFor = (applicationType: ApplicationTypeOption): string =>
    applicationType === ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID ? GA_UPLOAD_DOCUMENTS_COSC_URL : GA_UPLOAD_DOCUMENTS_URL;

  const urlWithIndex = (path: string): string =>
    constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, path), undefined);

  const useApplicationType = (applicationType: ApplicationTypeOption): void => {
    claim = new Claim();
    claim.generalApplication = new GeneralApplication();
    claim.generalApplication.applicationTypes = [new ApplicationType(applicationType)];
    mockGetClaimById.mockResolvedValue(claim);
    mockGetCaseData.mockResolvedValue(claim);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: {save: jest.fn((callback: () => void) => callback())},
    };
    res = createMockResponse();
    next = jest.fn();
    useApplicationType(ApplicationTypeOption.SET_ASIDE_JUDGEMENT);
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (draftStoreService.saveDraftClaim as jest.Mock).mockResolvedValue(undefined);
    uploadDocument.mockResolvedValue({documentName: 'test.txt'} as CaseDocument);
    deleteDocument.mockResolvedValue(undefined);
  });

  afterAll(() => {
    uploadDocument.mockRestore();
    deleteDocument.mockRestore();
  });

  describe('on GET', () => {
    it.each([
      [ApplicationTypeOption.SET_ASIDE_JUDGEMENT, 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CANCEL_JUDGMENT'],
      [ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID, 'COMMON.ASK_FOR_PROOF_OF_DEBT_PAYMENT'],
    ])('should render the upload page for %s', async (applicationType, headerTitle) => {
      useApplicationType(applicationType);

      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        headerTitle,
        backLinkUrl: BACK_URL,
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should not remove a document on a GET request', async () => {
      claim.generalApplication.uploadEvidenceForApplication.push(uploadedDocument('first'), uploadedDocument('second'));
      req.query = {id: '1'};

      await getHandler(req as never, res as unknown as Response, next);

      expect(claim.generalApplication.uploadEvidenceForApplication).toHaveLength(2);
      expect(deleteDocument).not.toHaveBeenCalled();
      expect(res.render).toHaveBeenCalled();
    });

    it('should render file upload errors stored in the session', async () => {
      req.session.fileUpload = JSON.stringify([{property: 'fileUpload', constraints: {isNotEmpty: 'ERRORS.VALID_CHOOSE_THE_FILE'}}]);
      req.session.fileUploadSource = FILE_UPLOAD_SOURCE.GA_UPLOAD_EVIDENCE;

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
      claim.generalApplication.uploadEvidenceForApplication.push(uploadedDocument('first'), uploadedDocument('second'));
      req.body = {action: 'deleteFile[0][first]'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(claim.generalApplication.uploadEvidenceForApplication).toEqual([uploadedDocument('second')]);
      expect(draftStoreService.saveDraftClaim).toHaveBeenCalled();
      expect(deleteDocument).toHaveBeenCalledTimes(1);
      expect(deleteDocument).toHaveBeenCalledWith(expect.anything(), 'first');
      expect(res.redirect).toHaveBeenCalledWith(urlWithIndex(GA_UPLOAD_DOCUMENTS_URL));
    });

    it('should not delete anything when a stale page asks to delete a document that has moved', async () => {
      claim.generalApplication.uploadEvidenceForApplication.push(uploadedDocument('first'), uploadedDocument('second'));
      req.body = {action: 'deleteFile[0][second]'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(claim.generalApplication.uploadEvidenceForApplication).toHaveLength(2);
      expect(draftStoreService.saveDraftClaim).not.toHaveBeenCalled();
      expect(deleteDocument).not.toHaveBeenCalled();
    });

    it('should redirect back when the upload button is used without a file', async () => {
      req.body = {action: 'uploadButton'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(uploadDocument).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(urlWithIndex(GA_UPLOAD_DOCUMENTS_URL));
    });

    it('should redirect back when multer reports a file error', async () => {
      req.body = {action: 'uploadButton'};
      req.multerError = {code: 'LIMIT_FILE_SIZE'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(uploadDocument).not.toHaveBeenCalled();
      expect(req.session.save).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(urlWithIndex(GA_UPLOAD_DOCUMENTS_URL));
    });

    it.each([
      ApplicationTypeOption.ADJOURN_HEARING,
      ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID,
    ])('should save the file and redirect back for %s', async (applicationType) => {
      useApplicationType(applicationType);
      req.body = {action: 'uploadButton'};
      req.file = uploadedFile;

      await postHandler(req as never, res as unknown as Response, next);

      expect(uploadDocument).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(urlWithIndex(pageFor(applicationType)));
    });

    it('should redirect back when continue is used with no documents', async () => {
      await postHandler(req as never, res as unknown as Response, next);

      expect(req.session.fileUploadSource).toBe(FILE_UPLOAD_SOURCE.GA_UPLOAD_EVIDENCE);
      expect(res.redirect).toHaveBeenCalledWith(urlWithIndex(GA_UPLOAD_DOCUMENTS_URL));
    });

    it('should call next when the document upload fails', async () => {
      const error = new Error('upload failure');
      uploadDocument.mockRejectedValue(error);
      req.body = {action: 'uploadButton'};
      req.file = uploadedFile;

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it.each([
      [ApplicationTypeOption.ADJOURN_HEARING, GA_HEARING_ARRANGEMENTS_GUIDANCE_URL],
      [ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID, GA_CHECK_YOUR_ANSWERS_COSC_URL],
    ])('should redirect to the next page for %s', async (applicationType, nextPage) => {
      useApplicationType(applicationType);
      claim.generalApplication.uploadEvidenceForApplication.push({caseDocument: {documentName: 'test.txt'}} as never);
      req.body = {action: 'submit'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(urlWithIndex(nextPage));
    });
  });
});
