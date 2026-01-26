import config from 'config';
import nock from 'nock';
import request from 'supertest';
import { isGaForLipsEnabled } from 'app/auth/launchdarkly/launchDarklyClient';
import * as draftService from 'modules/draft-store/draftStoreService';
import { Claim } from 'common/models/claim';
import { t } from 'i18next';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { ApplicationType, ApplicationTypeOption } from 'common/models/generalApplication/applicationType';
import { UploadGAFiles } from 'common/models/generalApplication/uploadGAFiles';
import { app } from '../../../../../../main/app';
import { GA_UPLOAD_N245_FORM_URL } from 'routes/urls';
import { TestMessages } from '../../../../../utils/errorMessageTestConstants';
import { CivilServiceClient } from 'client/civilServiceClient';
import { CaseDocument } from 'common/models/document/caseDocument';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));

describe('General Application - upload n245 form', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockDataFromStore = jest.spyOn(draftService, 'getCaseDataFromStore');
  let claim: Claim;
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);
  });

  beforeEach(() => {
    claim = new Claim();
    claim.generalApplication = new GeneralApplication();
    claim.generalApplication.applicationTypes.push(new ApplicationType(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT));
    claim.generalApplication.uploadN245Form = new UploadGAFiles();
    mockDataFromStore.mockResolvedValue(claim);
  });

  describe('on GET', () => {
    it('should return page', async () => {
      await request(app)
        .get(GA_UPLOAD_N245_FORM_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.VARY_JUDGMENT'));
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.TITLE'));
        });
    });
    it('should remove the file upon click', async () => {
      const mockCaseDocument: CaseDocument = <CaseDocument>{
        createdBy: 'test',
        documentLink: { document_url: 'http://test', document_binary_url: 'http://test/binary', document_filename: 'test.png' },
        documentName: 'test.text',
        documentType: null,
        documentSize: 12345,
        createdDatetime: new Date(),
      };
      claim.generalApplication.uploadN245Form.caseDocument = mockCaseDocument;
      mockDataFromStore.mockResolvedValue(claim);
      await request(app)
        .get(`${GA_UPLOAD_N245_FORM_URL}?action=REMOVE_DOC`)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.VARY_JUDGMENT'));
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.TITLE'));
          expect(claim.generalApplication.uploadN245Form).toBeUndefined();
        });
    });
    it('should return http 500 when has error in the get method', async () => {
      mockDataFromStore.mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));
      await request(app)
        .get(GA_UPLOAD_N245_FORM_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should throw the error if user click upload file button without uploading', async () => {
      await request(app)
        .post(GA_UPLOAD_N245_FORM_URL)
        .field('action', 'uploadButton')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('You need to choose a file before clicking');
        });
    });
    it('should save the file and display', async () => {
      const file = {
        fieldname: 'selectedFile',
        originalname: 'test.text',
        mimetype: 'text/plain',
        size: 123,
        buffer: Buffer.from('Test file content'),
      };
      const mockCaseDocument: CaseDocument = <CaseDocument>{
        createdBy: 'test',
        documentLink: { document_url: 'http://test', document_binary_url: 'http://test/binary', document_filename: 'test.png' },
        documentName: 'test.text',
        documentType: null,
        documentSize: 12345,
        createdDatetime: new Date(),
      };
      jest.spyOn(CivilServiceClient.prototype, 'uploadDocument').mockResolvedValueOnce(mockCaseDocument);
      await request(app)
        .post(GA_UPLOAD_N245_FORM_URL)
        .field('action', 'uploadButton')
        .attach('selectedFile', file.buffer, { filename: file.originalname, contentType: file.mimetype })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(file.originalname);
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
        .post(GA_UPLOAD_N245_FORM_URL)
        .field('action', 'uploadButton')
        .attach('selectedFile', file.buffer, { filename: file.originalname, contentType: file.mimetype })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should handle multer error when file size exceeds limit', async () => {
      // Create a buffer that exceeds the 100MB limit to trigger multer error
      const largeBuffer = Buffer.alloc(101 * 1024 * 1024); // 101MB
      largeBuffer.fill('x');

      await request(app)
        .post(GA_UPLOAD_N245_FORM_URL)
        .field('action', 'uploadButton')
        .attach('selectedFile', largeBuffer, {
          filename: 'large-file.pdf',
          contentType: 'application/pdf',
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.TITLE'));
        });
    });
  });
});
