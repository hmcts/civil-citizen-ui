import {NextFunction, Response} from 'express';
import {CivilServiceClient} from 'client/civilServiceClient';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {Party} from 'models/party';
import {
  TypeOfDocuments,
  TypeOfMediationDocuments,
  UploadDocuments,
} from 'models/mediation/uploadDocuments/uploadDocuments';
import mediationUploadDocumentsController from 'routes/features/mediation/uploadDocuments/uploadDocumentsController';
import {MEDIATION_UPLOAD_DOCUMENTS, MEDIATION_UPLOAD_DOCUMENTS_CHECK_AND_SEND} from 'routes/urls';
import {saveUploadDocument} from 'services/features/mediation/uploadDocuments/uploadDocumentsService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(),
  getCaseDataFromStore: jest.fn(),
}));

jest.mock('services/features/mediation/uploadDocuments/uploadDocumentsService', () => {
  const actual = jest.requireActual('services/features/mediation/uploadDocuments/uploadDocumentsService');
  return {
    ...actual,
    saveUploadDocument: jest.fn(),
  };
});

jest.mock('client/civilServiceClient', () => {
  const methods = {
    uploadDocument: jest.fn(),
  };
  return {CivilServiceClient: jest.fn(() => methods)};
});

const mockGenerateRedisKey = generateRedisKey as jest.Mock;
const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockSaveUploadDocument = saveUploadDocument as jest.Mock;
const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  uploadDocument: jest.Mock;
};

const claimId = '1111';
const redisKey = '12345';
const viewPath = 'features/mediation/uploadDocuments/upload-documents';
const caseDocument = JSON.stringify({
  documentLink: {
    document_url: 'http://test',
    document_binary_url: 'http://test/binary',
    document_filename: 'test.png',
  },
  documentName: 'test.png',
  documentSize: 86349,
  createdDatetime: '2023-06-27T11:32:29',
  createdBy: 'test',
});

type UploadRequest = Omit<Partial<AppRequest>, 'files'> & {
  files?: Array<Record<string, unknown>>;
  multerError?: {code: string};
};

const uploadedFile = (fieldname: string) => ({
  fieldname,
  originalname: 'test.txt',
  mimetype: 'text/plain',
  size: 123,
  buffer: Buffer.from('Test file content'),
});

const invoke = async (method: 'get' | 'post', overrides: UploadRequest = {}) => {
  const res = createMockResponse();
  const next = jest.fn() as NextFunction;
  const req = {
    params: {id: claimId},
    body: {},
    query: {},
    cookies: {},
    session: createMockSession({user: {id: 'user-1'}}),
    ...overrides,
  };
  await getRouteHandler(mediationUploadDocumentsController, method, MEDIATION_UPLOAD_DOCUMENTS)(
    req as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

const renderedForm = (res: ReturnType<typeof createMockResponse>) =>
  (res.render as jest.Mock).mock.calls[0][1].form;

const claimWithTypes = (): Claim => {
  const claim = new Claim();
  claim.respondent1 = new Party();
  claim.respondent1.partyDetails = {firstName: 'John', lastName: 'Smith'};
  claim.mediationUploadDocuments = new UploadDocuments([
    new TypeOfDocuments(1, TypeOfMediationDocuments.YOUR_STATEMENT, true),
    new TypeOfDocuments(2, TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT, true),
  ]);
  return claim;
};

describe('Mediation upload your documents Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue(redisKey);
    mockGetCaseData.mockResolvedValue(claimWithTypes());
    mockSaveUploadDocument.mockResolvedValue(undefined);
    civilServiceMethods.uploadDocument.mockResolvedValue({
      documentLink: {document_url: 'http://test'},
      documentName: 'test.png',
    });
  });

  describe('on GET', () => {
    it('should open upload your document page', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.UPLOAD_YOUR_DOCUMENTS.TITLE',
        claimId: expect.any(String),
      }));
    });

    it('should call next when loading upload documents fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should valid to the mediation when is documentsForYourStatement Upload documents page', async () => {
      const {res} = await invoke('post', {
        body: {
          documentsForYourStatement: [{
            yourName: '',
            dateInputFields: {dateDay: '', dateMonth: '', dateYear: ''},
            fileUpload: '',
          }],
        },
      });

      const form = renderedForm(res);
      expect(form.hasErrors()).toBe(true);
      expect(form.getAllErrors().some((error: {text?: string}) => error.text === 'ERRORS.VALID_ENTER_YOUR_NAME')).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to the next page when inputs are validated with documentsForYourStatement', async () => {
      const {res} = await invoke('post', {
        body: {
          documentsForYourStatement: [{
            yourName: 'Word',
            dateInputFields: {dateDay: '14', dateMonth: '10', dateYear: '2020'},
            caseDocument,
          }],
        },
      });

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, MEDIATION_UPLOAD_DOCUMENTS_CHECK_AND_SEND));
    });

    it('should redirect to the next page when inputs are validated with documentsReferred', async () => {
      const {res} = await invoke('post', {
        body: {
          documentsForDocumentsReferred: [{
            typeOfDocument: 'Word',
            dateInputFields: {dateDay: '14', dateMonth: '10', dateYear: '2020'},
            caseDocument,
          }],
        },
      });

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, MEDIATION_UPLOAD_DOCUMENTS_CHECK_AND_SEND));
    });

    it('should add another yourStatement', async () => {
      const {res, next} = await invoke('post', {
        body: {
          action: 'add_another-yourStatement',
          documentsForYourStatement: [{
            yourName: 'Word',
            dateInputFields: {dateDay: '14', dateMonth: '10', dateYear: '2020'},
            caseDocument,
          }],
        },
      });

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.any(Object));
      expect(mockSaveUploadDocument).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should add another documentsReferred', async () => {
      const {res} = await invoke('post', {
        body: {
          action: 'add_another-documentsReferred',
          documentsForYourStatement: [{
            yourName: 'Word',
            dateInputFields: {dateDay: '14', dateMonth: '10', dateYear: '2020'},
            caseDocument,
          }],
        },
      });

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.any(Object));
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should upload file yourStatement', async () => {
      const {res, next} = await invoke('post', {
        body: {
          action: 'documentsForYourStatement[0][uploadButton]',
          documentsForYourStatement: [{
            yourName: 'test document',
            dateInputFields: {dateDay: '12', dateMonth: '11', dateYear: '2020'},
          }],
        },
        files: [uploadedFile('documentsForYourStatement[0][fileUpload]')],
      });

      expect(civilServiceMethods.uploadDocument).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.any(Object));
      expect(next).not.toHaveBeenCalled();
    });

    it('should upload file documentsReferred', async () => {
      const {res} = await invoke('post', {
        body: {
          action: 'documentsForDocumentsReferred[0][uploadButton]',
          documentsForDocumentsReferred: [{
            typeOfDocument: 'test document',
            dateInputFields: {dateDay: '12', dateMonth: '11', dateYear: '2020'},
          }],
        },
        files: [uploadedFile('documentsForDocumentsReferred[0][fileUpload]')],
      });

      expect(civilServiceMethods.uploadDocument).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.any(Object));
    });

    it('should remove item documentsReferred', async () => {
      const {res} = await invoke('post', {
        body: {
          action: 'documentsForDocumentsReferred[0][removeButton]',
          documentsForDocumentsReferred: [{
            typeOfDocument: 'Word',
            dateInputFields: {dateDay: '14', dateMonth: '10', dateYear: '2020'},
            caseDocument,
          }],
        },
      });

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.any(Object));
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should remove item documentsForYourStatement', async () => {
      const {res} = await invoke('post', {
        body: {
          action: 'documentsForYourStatement[0][removeButton]',
          documentsForYourStatement: [{
            yourName: 'Word',
            dateInputFields: {dateDay: '14', dateMonth: '10', dateYear: '2020'},
            caseDocument,
          }],
        },
      });

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.any(Object));
    });

    it('should call next when saving upload documents fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      const {next} = await invoke('post');

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle multer error when action includes uploadButton and render view with error', async () => {
      const {res, next} = await invoke('post', {
        body: {action: 'documentsForYourStatement[0][uploadButton]'},
        multerError: {code: 'LIMIT_FILE_SIZE'},
      });

      const form = renderedForm(res);
      expect(form.hasErrors()).toBe(true);
      expect(civilServiceMethods.uploadDocument).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });
});
