import config from 'config';
import nock from 'nock';
import request from 'supertest';
import * as draftService from 'modules/draft-store/draftStoreService';
import { Claim } from 'common/models/claim';
import { t } from 'i18next';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { FILE_UPLOAD_SOURCE } from 'common/utils/fileUploadUtils';
import { app } from '../../../../../../main/app';
import {
  BACK_URL,
  GA_CHECK_YOUR_ANSWERS_COSC_URL,
  GA_HEARING_ARRANGEMENTS_GUIDANCE_URL,
  GA_UPLOAD_DOCUMENTS_COSC_URL,
  GA_UPLOAD_DOCUMENTS_URL,
} from 'routes/urls';
import { TestMessages } from '../../../../../utils/errorMessageTestConstants';
import { CivilServiceClient } from 'client/civilServiceClient';
import { CaseDocument } from 'common/models/document/caseDocument';
import * as launchDarkly from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {Session} from 'express-session';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../main/routes/guards/generalAplicationGuard',() => ({
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

describe('General Application - upload evidence docs to support application', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockDataFromStore = jest.spyOn(draftService, 'getCaseDataFromStore');
  let claim: Claim;
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
    claim.generalApplication.applicationTypes = [new ApplicationType(ApplicationTypeOption.SET_ASIDE_JUDGEMENT)];
    mockDataFromStore.mockResolvedValue(claim);
  });

  describe('on GET', () => {
    it.each`
    requestUrl                        | expectedBackUrl                       | selectedApplicationType                         | expectedText
    ${GA_UPLOAD_DOCUMENTS_URL}        | ${BACK_URL}    | ${ApplicationTypeOption.SET_ASIDE_JUDGEMENT}    | ${'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CANCEL_JUDGMENT'}
    ${GA_UPLOAD_DOCUMENTS_COSC_URL}   | ${BACK_URL}  | ${ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID}  | ${'Confirm you&#39;ve paid a judgment debt'}
    `('should return upload document page for $requestUrl with corresponding back url ($expectedUrl)'
      , async ({requestUrl, expectedBackUrl, selectedApplicationType, expectedText}) => {
        //Given
        claim = new Claim();
        claim.id ='id';
        claim.generalApplication = new GeneralApplication();
        claim.generalApplication.applicationTypes = [new ApplicationType(selectedApplicationType)];
        mockDataFromStore.mockResolvedValue(claim);
        //When
        await request(app)
          .get(requestUrl)
          //Then
          .expect((res) => {
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.UPLOAD_DOCUMENTS.TITLE'));
            expect(res.text).toContain(t(expectedText));
            expect(res.text).toContain(expectedBackUrl);
          });
      });

    it('should remove the requested file', async () => {
      const uploadDocument = new UploadGAFiles();
      uploadDocument.caseDocument = mockCaseDocument;
      uploadDocument.fileUpload = file;

      claim.generalApplication.uploadEvidenceForApplication.push(uploadDocument);
      claim.generalApplication.uploadEvidenceForApplication.push(uploadDocument);
      const currentDocuments = 2;
      const res = await request(app).get(GA_UPLOAD_DOCUMENTS_URL + '?id=1');
      expect(res.status).toBe(302);
      expect(res.header.location).toBeDefined();
      expect(res.header.location).not.toContain('?id=1');
      expect(claim.generalApplication.uploadEvidenceForApplication.length).toBe(currentDocuments - 1);
      const redirectPath = res.header.location.startsWith('http') ? new URL(res.header.location).pathname : res.header.location;
      const pageRes = await request(app).get(redirectPath);
      expect(pageRes.status).toBe(200);
      expect(pageRes.text).toContain(t('PAGES.GENERAL_APPLICATION.UPLOAD_DOCUMENTS.TITLE'));
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

      app.request.session = { fileUpload: JSON.stringify(errors), fileUploadSource: FILE_UPLOAD_SOURCE.GA_UPLOAD_EVIDENCE } as unknown as Session;
      await request(app)
        .get(GA_UPLOAD_DOCUMENTS_URL)
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

      app.request.session = { fileUpload: JSON.stringify(errors), fileUploadSource: FILE_UPLOAD_SOURCE.GA_UPLOAD_EVIDENCE } as unknown as Session;
      await request(app)
        .get(GA_UPLOAD_DOCUMENTS_URL)
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

      app.request.session = { fileUpload: JSON.stringify(errors), fileUploadSource: FILE_UPLOAD_SOURCE.GA_UPLOAD_EVIDENCE } as unknown as Session;
      await request(app)
        .get(GA_UPLOAD_DOCUMENTS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_CHOOSE_THE_FILE'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockDataFromStore.mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));
      await request(app)
        .get(GA_UPLOAD_DOCUMENTS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should throw the error if user click upload file button without uploading', async () => {
      await request(app)
        .post(GA_UPLOAD_DOCUMENTS_URL)
        .field('action', 'uploadButton')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(GA_UPLOAD_DOCUMENTS_URL);
        });
    });

    it('should redirect back when file over 100MB (multer LIMIT_FILE_SIZE)', async () => {
      const largeBuffer = Buffer.alloc(101 * 1024 * 1024);
      largeBuffer.fill('x');
      const res = await request(app)
        .post(GA_UPLOAD_DOCUMENTS_URL)
        .field('action', 'uploadButton')
        .attach('selectedFile', largeBuffer, { filename: 'large.pdf', contentType: 'application/pdf' });
      expect(res.status).toBe(302);
      expect(res.header.location).toContain('upload-documents');
    });

    it.each([
      GA_UPLOAD_DOCUMENTS_URL,
      GA_UPLOAD_DOCUMENTS_COSC_URL,
    ])('should save the file and display', async (url) => {
      jest.spyOn(CivilServiceClient.prototype, 'uploadDocument').mockResolvedValueOnce(mockCaseDocument);
      await request(app)
        .post(url)
        .field('action', 'uploadButton')
        .attach('selectedFile', file.buffer, { filename: file.originalname, contentType: file.mimetype })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(GA_UPLOAD_DOCUMENTS_URL);
        });
    });

    it('should throw the error if user click continue button without uploading a file', async () => {
      await request(app)
        .post(GA_UPLOAD_DOCUMENTS_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(GA_UPLOAD_DOCUMENTS_URL);
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
        .post(GA_UPLOAD_DOCUMENTS_URL)
        .field('action', 'uploadButton')
        .attach('selectedFile', file.buffer, { filename: file.originalname, contentType: file.mimetype })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it.each`
    selectedApplicationType                                                     | expectedUrl
    ${ApplicationTypeOption.ADJOURN_HEARING}                                    | ${GA_UPLOAD_DOCUMENTS_URL+'?index=undefined'}
    ${ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID}                              | ${GA_UPLOAD_DOCUMENTS_COSC_URL+'?index=undefined'}
    `('should redirect to current page ($expectedUrl) when application type is $selectedApplicationType',
      async ({ selectedApplicationType, expectedUrl}) => {
        //Given
        claim = new Claim();
        claim.id ='id';
        claim.generalApplication = new GeneralApplication();
        claim.generalApplication.applicationTypes = [new ApplicationType(selectedApplicationType)];
        mockDataFromStore.mockResolvedValue(claim);
        //When
        jest.spyOn(CivilServiceClient.prototype, 'uploadDocument').mockResolvedValueOnce(mockCaseDocument);
        await request(app)
          .post(GA_UPLOAD_DOCUMENTS_COSC_URL.replace(':id', '1111'))
          .field('action', 'uploadButton')
          .attach('selectedFile', file.buffer, { filename: file.originalname, contentType: file.mimetype })
          //Then
          .expect((res: { status: unknown, header: { location: unknown }, text: unknown; }) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(expectedUrl.replace(':id', '1111'));
          });
      });

    it.each`
    selectedApplicationType                                                     | expectedUrl
    ${ApplicationTypeOption.ADJOURN_HEARING}                                    | ${GA_HEARING_ARRANGEMENTS_GUIDANCE_URL+'?index=undefined'}
    ${ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID}                              | ${GA_CHECK_YOUR_ANSWERS_COSC_URL+'?index=undefined'}
    `('should redirect to next page ($expectedUrl) when application type is $selectedApplicationType', async ({ selectedApplicationType, expectedUrl}) => {
      //Given
      claim = new Claim();
      claim.id ='id';
      claim.generalApplication = new GeneralApplication();
      claim.generalApplication.applicationTypes = [new ApplicationType(selectedApplicationType)];
      mockDataFromStore.mockResolvedValue(claim);
      //When
      jest.spyOn(CivilServiceClient.prototype, 'uploadDocument').mockResolvedValueOnce(mockCaseDocument);
      await request(app)
        .post(GA_UPLOAD_DOCUMENTS_COSC_URL.replace(':id', '1111'))
        .field('action', 'uploadButton')
        .attach('selectedFile', file.buffer, { filename: file.originalname, contentType: file.mimetype });
      await request(app)
        .post(GA_UPLOAD_DOCUMENTS_COSC_URL.replace(':id', '1111'))
        .field('action', 'submit')
        //Then
        .expect((res: { status: unknown, header: { location: unknown }, text: unknown; }) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(expectedUrl.replace(':id', '1111'));
        });
    });

  });
});
