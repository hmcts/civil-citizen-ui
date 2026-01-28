import {app} from '../../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {t} from 'i18next';
import {GA_RESPONDENT_UPLOAD_DOCUMENT_URL} from 'routes/urls';
import * as draftService from 'modules/draft-store/draftStoreService';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import * as gaStoreResponseService from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {Claim} from 'models/claim';
import {CivilServiceClient} from 'client/civilServiceClient';
import {isGaForLipsEnabled} from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {CaseDocument} from 'models/document/caseDocument';
import {YesNo} from 'form/models/yesNo';
import {Session} from 'express-session';
import { ApplicationTypeOption } from 'common/models/generalApplication/applicationType';
import { constructResponseUrlWithIdAndAppIdParams } from 'common/utils/urlFormatter';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../../main/services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  saveDraftGARespondentResponse: jest.fn(),
  getDraftGARespondentResponse: jest.fn(),
}));
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
  let gaResponse: GaResponse;
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);
  });

  beforeEach(() => {
    claim = new Claim();
    claim.respondentGaAppDetails = [{ generalAppTypes: [ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT], gaApplicationId: '345', caseState: '', generalAppSubmittedDateGAspec: '' }];
    gaResponse = new GaResponse();
    gaResponse.generalApplicationType = [ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT];
    gaResponse.wantToUploadDocuments = YesNo.YES;
    mockDataFromStore.mockResolvedValue(claim);
  });

  describe('General Application - Respondent upload evidence docs to support application', () => {
    it('should return upload document page', async () => {
      jest.spyOn(gaStoreResponseService, 'getDraftGARespondentResponse').mockResolvedValue(gaResponse);
      await request(app)
        .get(constructResponseUrlWithIdAndAppIdParams('123', '345', GA_RESPONDENT_UPLOAD_DOCUMENT_URL))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.RESPONDENT_UPLOAD_DOCUMENTS.TITLE'));
        });
    });

    it('should remove the requested file', async () => {
      const document = new UploadGAFiles();
      document.caseDocument = mockCaseDocument;
      document.fileUpload = file;
      gaResponse.uploadEvidenceDocuments.push(document);
      gaResponse.uploadEvidenceDocuments.push(document);
      jest.spyOn(gaStoreResponseService, 'getDraftGARespondentResponse').mockResolvedValue(gaResponse);
      await request(app)
        .get(constructResponseUrlWithIdAndAppIdParams('123', '345', GA_RESPONDENT_UPLOAD_DOCUMENT_URL + '?id=1'))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.RESPONDENT_UPLOAD_DOCUMENTS.TITLE'));
          expect(gaResponse.uploadEvidenceDocuments.length).toEqual(1);
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
      jest.spyOn(gaStoreResponseService, 'getDraftGARespondentResponse').mockResolvedValue(gaResponse);
      await request(app)
        .get(constructResponseUrlWithIdAndAppIdParams('123', '345', GA_RESPONDENT_UPLOAD_DOCUMENT_URL))
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
      jest.spyOn(gaStoreResponseService, 'getDraftGARespondentResponse').mockResolvedValue(gaResponse);
      await request(app)
        .get(constructResponseUrlWithIdAndAppIdParams('123', '345', GA_RESPONDENT_UPLOAD_DOCUMENT_URL))
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
      jest.spyOn(gaStoreResponseService, 'getDraftGARespondentResponse').mockResolvedValue(gaResponse);
      await request(app)
        .get(constructResponseUrlWithIdAndAppIdParams('123', '345', GA_RESPONDENT_UPLOAD_DOCUMENT_URL))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_CHOOSE_THE_FILE'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockDataFromStore.mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));
      await request(app)
        .get(GA_RESPONDENT_UPLOAD_DOCUMENT_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should throw the error if user click upload file button without uploading', async () => {
      await request(app)
        .post(constructResponseUrlWithIdAndAppIdParams('123', '345', GA_RESPONDENT_UPLOAD_DOCUMENT_URL))
        .field('action', 'uploadButton')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(constructResponseUrlWithIdAndAppIdParams('123', '345', GA_RESPONDENT_UPLOAD_DOCUMENT_URL));
        });
    });

    it('should redirect back when file over 100MB (multer LIMIT_FILE_SIZE)', async () => {
      const largeBuffer = Buffer.alloc(101 * 1024 * 1024);
      largeBuffer.fill('x');
      const res = await request(app)
        .post(constructResponseUrlWithIdAndAppIdParams('123', '345', GA_RESPONDENT_UPLOAD_DOCUMENT_URL))
        .field('action', 'uploadButton')
        .attach('selectedFile', largeBuffer, { filename: 'large.pdf', contentType: 'application/pdf' });
      expect(res.status).toBe(302);
      expect(res.header.location).toContain('upload-documents');
    });

    it('should throw the error if user click continue button without uploading a file', async () => {
      jest.spyOn(gaStoreResponseService, 'getDraftGARespondentResponse').mockResolvedValue(gaResponse);
      await request(app)
        .post(constructResponseUrlWithIdAndAppIdParams('123', '345', GA_RESPONDENT_UPLOAD_DOCUMENT_URL))
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(constructResponseUrlWithIdAndAppIdParams('123', '345', GA_RESPONDENT_UPLOAD_DOCUMENT_URL));
        });
    });

    it('should save the file and display', async () => {
      jest.spyOn(CivilServiceClient.prototype, 'uploadDocument').mockResolvedValueOnce(mockCaseDocument);
      jest.spyOn(gaStoreResponseService, 'getDraftGARespondentResponse').mockResolvedValue(gaResponse);
      await request(app)
        .post(constructResponseUrlWithIdAndAppIdParams('123', '345', GA_RESPONDENT_UPLOAD_DOCUMENT_URL))
        .field('action', 'uploadButton')
        .attach('selectedFile', file.buffer, { filename: file.originalname, contentType: file.mimetype })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(constructResponseUrlWithIdAndAppIdParams('123', '345', GA_RESPONDENT_UPLOAD_DOCUMENT_URL));
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
        .post(GA_RESPONDENT_UPLOAD_DOCUMENT_URL)
        .field('action', 'uploadButton')
        .attach('selectedFile', file.buffer, { filename: file.originalname, contentType: file.mimetype })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});

