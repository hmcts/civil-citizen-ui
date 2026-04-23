import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {GA_HEARING_ARRANGEMENTS_GUIDANCE_URL, GA_UPLOAD_DOCUMENTS_URL, GA_WANT_TO_UPLOAD_DOCUMENTS_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {YesNo} from 'form/models/yesNo';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import { Claim } from 'common/models/claim';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import * as launchDarkly from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {CaseDocument} from 'models/document/caseDocument';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockSaveCaseData = saveDraftClaim as jest.Mock;
const mockClaim = new Claim();
mockClaim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING));

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

describe('General Application - Want to upload documents to support hearing', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
  });

  describe('on GET', () => {
    it('should return want to upload document page', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      mockClaim.generalApplication.applicationTypes = [new ApplicationType(ApplicationTypeOption.SET_ASIDE_JUDGEMENT)];
      await request(app)
        .get(GA_WANT_TO_UPLOAD_DOCUMENTS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.WANT_TO_UPLOAD_DOCUMENTS.TITLE'));
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CANCEL_JUDGMENT'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(GA_WANT_TO_UPLOAD_DOCUMENTS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should send the value and redirect to Upload document page', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app)
        .post(GA_WANT_TO_UPLOAD_DOCUMENTS_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(GA_UPLOAD_DOCUMENTS_URL);
        });
    });

    it('should send the value and redirect to application hearing arrangement page', async () => {
      const uploadDocument = new UploadGAFiles();
      uploadDocument.caseDocument = mockCaseDocument;
      uploadDocument.fileUpload = file;

      mockClaim.generalApplication.uploadEvidenceForApplication.push(uploadDocument);
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app)
        .post(GA_WANT_TO_UPLOAD_DOCUMENTS_URL)
        .send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(GA_HEARING_ARRANGEMENTS_GUIDANCE_URL);
          expect(mockClaim.generalApplication.uploadEvidenceForApplication).toEqual([]);
        });
    });

    it('should show error message if radio button not selected', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app)
        .post(GA_WANT_TO_UPLOAD_DOCUMENTS_URL)
        .send({option: null})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.GENERAL_APPLICATION.WANT_TO_UPLOAD_DOCUMENTS_YES_NO_SELECTION'));
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      mockSaveCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(GA_WANT_TO_UPLOAD_DOCUMENTS_URL)
        .send({option:YesNo.NO })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});

