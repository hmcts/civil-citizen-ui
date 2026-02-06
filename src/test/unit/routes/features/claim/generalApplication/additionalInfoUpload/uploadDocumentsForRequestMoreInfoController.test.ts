import config from 'config';
import nock from 'nock';
import request from 'supertest';
import * as draftService from 'modules/draft-store/draftStoreService';
import * as draftServiceGA from 'modules/draft-store/draftGADocumentService';
import { Claim } from 'common/models/claim';
import { t } from 'i18next';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import {GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL, GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CYA_URL} from 'routes/urls';
import { CivilServiceClient } from 'client/civilServiceClient';
import { CaseDocument } from 'common/models/document/caseDocument';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {Session} from 'express-session';
import {app} from '../../../../../../../main/app';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import * as launchDarkly from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {FileUpload} from 'models/caseProgression/fileUpload';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/draft-store/draftGADocumentService');
jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));

const mockCaseDocument: CaseDocument = <CaseDocument>{
  createdBy: 'test',
  documentLink: { document_url: 'http://test', document_binary_url: 'http://test/binary', document_filename: 'test.png' },
  documentName: 'test.text',
  documentType: null,
  documentSize: 12345,
  createdDatetime: new Date(),
};
const file = {
  fieldname: 'selectedFile',
  originalname: 'test.text',
  mimetype: 'text/plain',
  size: 123,
  buffer: Buffer.from('Test file content'),
};

describe('General Application - uploadDocumentsForRequestMoreInfoController.ts', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockDataFromStore = jest.spyOn(draftService, 'getCaseDataFromStore');
  const mockGADocDataFromStore = jest.spyOn(draftServiceGA, 'getGADocumentsFromDraftStore');
  let claim: Claim;
  let uploadDocuments: UploadGAFiles[];
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
    jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
  });

  beforeEach(() => {
    claim = new Claim();
    claim.id ='id';
    claim.generalApplication = new GeneralApplication();
    mockDataFromStore.mockResolvedValue(claim);

    uploadDocuments = [
      {
        caseDocument: {
          documentName: 'Additional information1',
          createdBy: 'Applicant',
          documentLink: {
            document_url: 'http://dm-store:8080/documents/95de9948-e563-4692-a642-5cdd5b2a1046',
            document_binary_url: 'http://dm-store:8080/documents/95de9948-e563-4692-a642-5cdd5b2a1046',
            document_filename: 'filename1',
          },
          documentType: null,
          documentSize: 123,
        } as CaseDocument,
        fileUpload: {} as FileUpload,
      },
      {
        caseDocument: {
          documentName: 'Additional information2',
          createdBy: 'Applicant',
          documentLink: {
            document_url: 'http://dm-store:8080/documents/95de9948-e563-4692-a642-5cdd5b2a1047',
            document_binary_url: 'http://dm-store:8080/documents/95de9948-e563-4692-a642-5cdd5b2a1047',
            document_filename: 'filename2',
          },
          documentType: null,
          documentSize: 1223,
        } as CaseDocument,
        fileUpload: {} as FileUpload,
      },
    ];
    mockGADocDataFromStore.mockResolvedValue(uploadDocuments);
  });

  describe('on GET', () => {
    it('should return upload document page', async () => {
      await request(app)
        .get(GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.UPLOAD_MORE_INFO_DOCUMENTS.PAGE_TITLE_TO_UPLOAD'));
        });
    });

    it('should remove the 2nd file from list', async () => {
      await request(app)
        .get(GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL+'?id=2')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.UPLOAD_MORE_INFO_DOCUMENTS.PAGE_TITLE_TO_UPLOAD'));
          expect(res.text).toContain(uploadDocuments[0].caseDocument.documentName);
        });
    });

    it('should return page with errors when file to be uploaded has unsupported file type', async () => {
      const errors =   [
        {
          value: 'application/json',
          property: 'fileUpload[mimetype]',
          constraints: { isAllowedMimeType: 'ERRORS.VALID_MIME_TYPE_FILE' },
          fieldName: 'fileUpload[mimetype]',
          text: 'Document must be Word, Excel, PowerPoint, PDF, RTF, TXT, CSV, JPG, JPEG, PNG, BMP, TIF, TIFF',
          href: '#fileUpload[mimetype]',
        },
      ];

      app.request.session = { fileUpload:JSON.stringify(errors) } as unknown as Session;
      await request(app)
        .get(GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_MIME_TYPE_FILE'));
        });
    });

    it('should return page with errors when file to be uploaded has size > 100MB', async () => {
      const errors =   [
        {
          target: {},
          value: 162819440,
          property: 'fileUpload[size]',
          constraints: { fileSizeValidator: 'ERRORS.VALID_SIZE_FILE' },
          fieldName: 'fileUpload[size]',
          text: 'Document must be less than 100MB',
          href: '#fileUpload[size]',
        },
      ];

      app.request.session = { fileUpload:JSON.stringify(errors) } as unknown as Session;
      await request(app)
        .get(GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_SIZE_FILE'));
        });
    });

    it('should return page with errors when upload file button clicked without choosing file', async () => {
      const errors =   [
        {
          target: {},
          property: 'fileUpload',
          constraints: { isNotEmpty: 'ERRORS.VALID_CHOOSE_THE_FILE' },
          fieldName: 'fileUpload',
          text: 'Choose the file you want to upload',
          href: '#fileUpload',
        },
      ];

      app.request.session = { fileUpload:JSON.stringify(errors) } as unknown as Session;
      await request(app)
        .get(GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_CHOOSE_THE_FILE'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockDataFromStore.mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));
      await request(app)
        .get(GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should throw the error if user click upload file button without uploading', async () => {
      await request(app)
        .post(GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL)
        .field('action', 'uploadButton')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL);
        });
    });

    it('should redirect back when file over 100MB (multer LIMIT_FILE_SIZE)', async () => {
      const largeBuffer = Buffer.alloc(101 * 1024 * 1024);
      largeBuffer.fill('x');
      const res = await request(app)
        .post(GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL)
        .field('action', 'uploadButton')
        .attach('selectedFile', largeBuffer, { filename: 'large.pdf', contentType: 'application/pdf' });
      expect(res.status).toBe(302);
      expect(res.header.location).toContain('upload-documents-for-addln-info');
    });

    it('should save the file and display', async () => {
      jest.spyOn(CivilServiceClient.prototype, 'uploadDocument').mockResolvedValueOnce(mockCaseDocument);
      await request(app)
        .post(GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL)
        .field('action', 'uploadButton')
        .attach('selectedFile', file.buffer, { filename: file.originalname, contentType: file.mimetype })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL);
        });
    });
    it('should return http 500 when has error in the get method', async () => {
      const file = {
        fieldname: 'selectedFile',
        originalname: 'test.text',
        mimetype: 'text/plain',
        size: 123,
        buffer: Buffer.from('Test file content'),
      };
      jest.spyOn(CivilServiceClient.prototype, 'uploadDocument').mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));
      await request(app)
        .post(GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL)
        .field('action', 'uploadButton')
        .attach('selectedFile', file.buffer, { filename: file.originalname, contentType: file.mimetype })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should set fileUpload error in session when no documents uploaded and form has fileUpload error', async () => {
      mockGADocDataFromStore.mockResolvedValueOnce([]);
      await request(app)
        .post(GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL)
        .field('action', 'continue')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header['location']).toContain(GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL);
        });
    });

    it('should redirect to CYA page when documents are uploaded successfully', async () => {
      const uploadDocuments = [
        {
          caseDocument: mockCaseDocument,
          fileUpload: {} as FileUpload,
        },
      ];
      mockGADocDataFromStore.mockResolvedValueOnce(uploadDocuments);
      await request(app)
        .post(GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL)
        .field('action', 'continue')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header['location']).toContain(GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CYA_URL);
        });
    });
  });
});
