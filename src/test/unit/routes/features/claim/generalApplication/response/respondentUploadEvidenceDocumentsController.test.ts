import {app} from '../../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {t} from 'i18next';
import {GA_RESPONDENT_UPLOAD_DOCUMENT} from 'routes/urls';
import * as draftService from 'modules/draft-store/draftStoreService';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {Claim} from 'models/claim';
import {CivilServiceClient} from 'client/civilServiceClient';
import {isGaForLipsEnabled} from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {CaseDocument} from 'models/document/caseDocument';
import {YesNo} from 'form/models/yesNo';
import {Session} from 'express-session';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/app/auth/launchdarkly/launchDarklyClient');

const mockCaseDocument: CaseDocument = <CaseDocument>{
  createdBy: 'test',
  documentLink: { document_url: 'http://test', document_binary_url: 'http://test/binary', document_filename: 'test.png' },
  documentName: 'test.text',
  documentType: null,
  documentSize: 12345,
  createdDatetime: new Date(),
};
const file = {
  fieldname: 'field name',
  mimetype: 'application/pdf',
  originalname: 'original name',
  size: 1234,
  buffer: Buffer.from('Test file content'),
};

describe('General Application - Respondent GA upload evidence documents ', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockDataFromStore = jest.spyOn(draftService, 'getCaseDataFromStore');
  let claim: Claim;
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);
  });

  beforeEach(() => {
    claim = new Claim();
    claim.generalApplication = new GeneralApplication();
    claim.generalApplication.applicationType = new ApplicationType(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT);
    claim.generalApplication.response = new GaResponse();
    claim.generalApplication.response.wantToUploadDocuments = YesNo.YES;
    mockDataFromStore.mockResolvedValue(claim);
  });

  describe('General Application - Respondent upload evidence docs to support application', () => {
    it('should return upload document page', async () => {
      await request(app)
        .get(GA_RESPONDENT_UPLOAD_DOCUMENT)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.RESPONDENT_UPLOAD_DOCUMENTS.TITLE'));
        });
    });

    it('should remove the requested file', async () => {
      const document = new UploadGAFiles();
      document.caseDocument = mockCaseDocument;
      document.fileUpload = file;
      claim.generalApplication.response.uploadEvidenceDocuments.push(document) ;
      claim.generalApplication.response.uploadEvidenceDocuments.push(document) ;
      mockDataFromStore.mockResolvedValue(claim);

      await request(app)
        .get(GA_RESPONDENT_UPLOAD_DOCUMENT+'?id=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.RESPONDENT_UPLOAD_DOCUMENTS.TITLE'));
          expect(claim.generalApplication.response.uploadEvidenceDocuments.length).toEqual(1);
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
        .get(GA_RESPONDENT_UPLOAD_DOCUMENT)
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
        .get(GA_RESPONDENT_UPLOAD_DOCUMENT)
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
        .get(GA_RESPONDENT_UPLOAD_DOCUMENT)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_CHOOSE_THE_FILE'));
        });
    });
    
    it('should return http 500 when has error in the get method', async () => {
      mockDataFromStore.mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));
      await request(app)
        .get(GA_RESPONDENT_UPLOAD_DOCUMENT)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should throw the error if user click upload file button without uploading', async () => {
      await request(app)
        .post(GA_RESPONDENT_UPLOAD_DOCUMENT)
        .field('action', 'uploadButton')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(GA_RESPONDENT_UPLOAD_DOCUMENT);
        });
    });

    it('should throw the error if user click continue button without uploading a file', async () => {
      await request(app)
        .post(GA_RESPONDENT_UPLOAD_DOCUMENT)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_CHOOSE_THE_FILE'));
        });
    });
    it('should save the file and display', async () => {
      jest.spyOn(CivilServiceClient.prototype, 'uploadDocument').mockResolvedValueOnce(mockCaseDocument);

      await request(app)
        .post(GA_RESPONDENT_UPLOAD_DOCUMENT)
        .field('action', 'uploadButton')
        .attach('selectedFile', file.buffer, { filename: file.originalname, contentType: file.mimetype })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(GA_RESPONDENT_UPLOAD_DOCUMENT);
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
        .post(GA_RESPONDENT_UPLOAD_DOCUMENT)
        .field('action', 'uploadButton')
        .attach('selectedFile', file.buffer, { filename: file.originalname, contentType: file.mimetype })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});

