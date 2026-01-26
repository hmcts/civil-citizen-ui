import config from 'config';
import nock from 'nock';
import request from 'supertest';
import { app } from '../../../../../../../main/app';
import {
  getClaimDetailsById,
  getSummaryList,
  removeSelectedDocument,
  uploadSelectedFile,
} from 'services/features/generalApplication/additionalDocumentService';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { getCancelUrl } from 'services/features/generalApplication/generalApplicationService';
import {
  GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL,
  GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL,
} from 'routes/urls';
import { Claim } from 'common/models/claim';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { isGaForLipsEnabled } from 'app/auth/launchdarkly/launchDarklyClient';
import { UploadAdditionalDocument } from 'common/models/generalApplication/UploadAdditionalDocument';
import { CaseDocument } from 'common/models/document/caseDocument';
import { FileUpload } from 'common/models/caseProgression/uploadDocumentsUserForm';
import { Session } from 'express-session';
import { t } from 'i18next';
import { constructResponseUrlWithIdAndAppIdParams } from 'common/utils/urlFormatter';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/services/features/generalApplication/additionalDocumentService', () => ({
  getClaimDetailsById: jest.fn(),
  getSummaryList: jest.fn(),
  uploadSelectedFile: jest.fn(),
  removeSelectedDocument: jest.fn(),
}));
jest.mock('../../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn((key) => key),
}));

jest.mock('../../../../../../../main/services/features/generalApplication/generalApplicationService', () => ({
  getCancelUrl: jest.fn(),
  getApplicationIndex: jest.fn(),
}));
jest.mock('../../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));
describe('uploadAdditionalDocumentsController', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const claimId = '123';
  const gaId = '456';
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
    jest.clearAllMocks();
  });

  describe('on Get request', () => {
    it('should render the upload additional documents page with correct data', async () => {
      const redisKey = 'redis-key';
      const cancelUrl = '/cancel-url';
      const formattedSummaryList = {
        title: '',
        summaryList: {
          rows: [
            {
              key: {
                text: 'Type of document',
              },
              value: {
                html: 'test',
              },
            },
            {
              key: {
                text: 'n245form.pdf',
              },
              value: {
                html: '',
              },
              actions: {
                items: [
                  {
                    href: '/case/1720536503257495/general-application/1720536653906339/upload-additional-documents?indexId=1',
                    text: 'Remove document',
                    visuallyHiddenText: 'n245form.pdf',
                  },
                ],
              },
            },
          ],
        },
      };
      (getClaimDetailsById as jest.Mock).mockResolvedValue(claim);
      (generateRedisKey as jest.Mock).mockReturnValue(redisKey);
      (getCancelUrl as jest.Mock).mockResolvedValue(cancelUrl);
      (getSummaryList as jest.Mock).mockReturnValue(formattedSummaryList);

      const res = await request(app).get(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL));

      expect(res.status).toBe(200);
      expect(getClaimDetailsById).toHaveBeenCalledWith(expect.anything());
      expect(generateRedisKey).toHaveBeenCalledWith(expect.anything());
      expect(getCancelUrl).toHaveBeenCalledWith(claimId, claim);
      expect(getSummaryList).toHaveBeenCalledWith(claim.generalApplication.uploadAdditionalDocuments, claimId, gaId, undefined);
      expect(res.text).toContain('Type of document');
      expect(res.text).toContain('test');
    });

    it('should render the upload additional documents page with correct welsh data', async () => {
      const redisKey = 'redis-key';
      const cancelUrl = '/cancel-url';
      const formattedSummaryList = {
        title: '',
        summaryList: {
          rows: [
            {
              key: {
                text: 'Type of document',
              },
              value: {
                html: 'test',
              },
            },
            {
              key: {
                text: 'n245form.pdf',
              },
              value: {
                html: '',
              },
              actions: {
                items: [
                  {
                    href: '/case/1720536503257495/general-application/1720536653906339/upload-additional-documents?indexId=1',
                    text: 'Remove document',
                    visuallyHiddenText: 'n245form.pdf',
                  },
                ],
              },
            },
          ],
        },
      };
      (getClaimDetailsById as jest.Mock).mockResolvedValue(claim);
      (generateRedisKey as jest.Mock).mockReturnValue(redisKey);
      (getCancelUrl as jest.Mock).mockResolvedValue(cancelUrl);
      (getSummaryList as jest.Mock).mockReturnValue(formattedSummaryList);

      const res = await request(app).get(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL)).query({lang: 'cy'});

      expect(res.status).toBe(200);
      expect(getSummaryList).toHaveBeenCalledWith(claim.generalApplication.uploadAdditionalDocuments, claimId, gaId, 'cy');
    });

    it('should remove the selected doc from the store', async () => {

      const additionalDocument = new UploadAdditionalDocument();
      additionalDocument.typeOfDocument = 'testt';
      additionalDocument.caseDocument = {
        documentLink: { document_binary_url: 'binary_url1', document_filename: 'testDoc', document_url: 'url' },
        documentName: 'testDoc',
        documentType: null,
        documentSize: 1000,
        createdDatetime: new Date(),
      } as CaseDocument;
      additionalDocument.fileUpload = new FileUpload();
      claim.generalApplication.uploadAdditionalDocuments = [additionalDocument];
      const redisKey = 'redis-key';
      const cancelUrl = '/cancel-url';
      (getClaimDetailsById as jest.Mock).mockResolvedValue(claim);
      (generateRedisKey as jest.Mock).mockReturnValue(redisKey);
      (getCancelUrl as jest.Mock).mockResolvedValue(cancelUrl);
      (getSummaryList as jest.Mock).mockReturnValue({});
      (removeSelectedDocument as jest.Mock).mockReturnValueOnce(void 0);

      const res = await request(app).get(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL)).query({ indexId: 1 });

      expect(res.status).toBe(200);
      expect(removeSelectedDocument).toHaveBeenCalledWith(redisKey, claim, 0);
    });

    it('should return page with errors when upload file button clicked without choosing file', async () => {
      const errors = [
        {
          target: {},
          property: 'fileUpload',
          constraints: { isNotEmpty: 'ERRORS.VALID_CHOOSE_THE_FILE' },
          fieldName: 'fileUpload',
          text: 'Choose the file you want to upload',
          href: '#fileUpload',
        },
      ];
      const additionalDocument = new UploadAdditionalDocument();
      additionalDocument.typeOfDocument = 'testt';
      additionalDocument.caseDocument = {
        documentLink: { document_binary_url: 'binary_url1', document_filename: 'testDoc', document_url: 'url' },
        documentName: 'testDoc',
        documentType: null,
        documentSize: 1000,
        createdDatetime: new Date(),
      } as CaseDocument;
      additionalDocument.fileUpload = new FileUpload();
      claim.generalApplication.uploadAdditionalDocuments = [additionalDocument];
      const redisKey = 'redis-key';
      const cancelUrl = '/cancel-url';
      (getClaimDetailsById as jest.Mock).mockResolvedValue(claim);
      (generateRedisKey as jest.Mock).mockReturnValue(redisKey);
      (getCancelUrl as jest.Mock).mockResolvedValue(cancelUrl);
      (getSummaryList as jest.Mock).mockReturnValue({});
      (removeSelectedDocument as jest.Mock).mockReturnValueOnce(void 0);
      app.request.session = { fileUpload: JSON.stringify(errors) } as unknown as Session;
      await request(app)
        .get(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_CHOOSE_THE_FILE'));
        });
    });

    it('should handle errors', async () => {
      (getClaimDetailsById as jest.Mock).mockRejectedValue(new Error('Error'));

      const res = await request(app).get(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL));

      expect(res.status).toBe(500);
    });
  });

  describe('on post request', () => {
    it('should handle file upload and redirect to the same page', async () => {
      (getClaimDetailsById as jest.Mock).mockResolvedValue(claim);
      (uploadSelectedFile as jest.Mock).mockResolvedValueOnce(void 0);

      const res = await request(app)
        .post(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL))
        .field('action', 'uploadButton')
        .attach('selectedFile', Buffer.from('file content'), 'test-file.txt');

      expect(res.status).toBe(302);
      expect(res.header['location']).toBe(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL));
      expect(uploadSelectedFile).toHaveBeenCalledWith(expect.anything(), claim);
    });

    it('should redirect to CYA page if documents are uploaded', async () => {
      const additionalDocument = new UploadAdditionalDocument();
      additionalDocument.typeOfDocument = 'testt';
      additionalDocument.caseDocument = {
        documentLink: { document_binary_url: 'binary_url1', document_filename: 'testDoc', document_url: 'url' },
        documentName: 'testDoc',
        documentType: null,
        documentSize: 1000,
        createdDatetime: new Date(),
      } as CaseDocument;
      additionalDocument.fileUpload = new FileUpload();
      claim.generalApplication.uploadAdditionalDocuments = [additionalDocument];

      (getClaimDetailsById as jest.Mock).mockResolvedValue(claim);

      const res = await request(app)
        .post(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL));

      expect(res.status).toBe(302);
      expect(res.header['location']).toBe(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL));
    });

    it('should set fileUpload error in session when no documents are uploaded', async () => {
      claim.generalApplication.uploadAdditionalDocuments = [];
      (getClaimDetailsById as jest.Mock).mockResolvedValue(claim);

      const res = await request(app)
        .post(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL));

      expect(res.status).toBe(302);
      expect(res.header['location']).toBe(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL));
    });

    it('should handle errors', async () => {
      (getClaimDetailsById as jest.Mock).mockRejectedValue(new Error('Error'));

      const res = await request(app)
        .post(constructResponseUrlWithIdAndAppIdParams('123', '456', GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL))
        .field('action', 'submit');

      expect(res.status).toBe(500);
    });

    it('should handle multer error when file size exceeds limit', async () => {
      (getClaimDetailsById as jest.Mock).mockResolvedValue(claim);

      // Create a buffer that exceeds the 100MB limit to trigger multer error
      const largeBuffer = Buffer.alloc(101 * 1024 * 1024); // 101MB
      largeBuffer.fill('x');

      const res = await request(app)
        .post(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL))
        .field('action', 'uploadButton')
        .attach('selectedFile', largeBuffer, {
          filename: 'large-file.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(302);
      expect(res.header['location']).toBe(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL));
    });
  });
});
