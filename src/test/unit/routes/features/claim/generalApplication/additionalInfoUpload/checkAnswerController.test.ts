import config from 'config';
import nock from 'nock';
import request from 'supertest';
import { isGaForLipsEnabled } from 'app/auth/launchdarkly/launchDarklyClient';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import {
  GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CONFIRMATION_URL,
  GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CYA_URL,
} from 'routes/urls';
import { Claim } from 'common/models/claim';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { GaServiceClient } from 'client/gaServiceClient';
import { ApplicationEvent } from 'common/models/gaEvents/applicationEvent';
import { constructResponseUrlWithIdAndAppIdParams } from 'common/utils/urlFormatter';
import {
  buildSummarySection,
} from 'services/features/generalApplication/additionalInfoUpload/uploadDocumentsForReqMoreInfoService';
import {app} from '../../../../../../../main/app';
import {getClaimById} from 'modules/utilityService';
import {CaseDocument} from 'models/document/caseDocument';
import {FileUpload} from 'models/caseProgression/fileUpload';
import {getGADocumentsFromDraftStore} from 'modules/draft-store/draftGADocumentService';
import {translateCUItoCCD} from 'services/features/generalApplication/documentUpload/uploadDocumentsService';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {
  getDraftGARespondentResponse,
} from 'services/features/generalApplication/response/generalApplicationResponseStoreService';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));
jest.mock('../../../../../../../main/modules/draft-store/draftGADocumentService', () => ({
  getGADocumentsFromDraftStore: jest.fn(),
}));
jest.mock('../../../../../../../main/services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  getDraftGARespondentResponse: jest.fn(),
}));
jest.mock('../../../../../../../main/services/features/generalApplication/additionalInfoUpload/uploadDocumentsForReqMoreInfoService', () => ({
  buildSummarySection: jest.fn(),
}));
jest.mock('../../../../../../../main/services/features/generalApplication/documentUpload/uploadDocumentsService', () => ({
  translateCUItoCCD: jest.fn(),
}));
jest.mock('../../../../../../../main/services/features/generalApplication/generalApplicationService', () => ({
  getCancelUrl: jest.fn(),
}));
jest.mock('../../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));

describe('General Application - additional docs check answer controller ', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);
  });
  const uploadDocuments = [
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

  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('GET check your answers', () => {
    it('should render the check answers page with correct data', async () => {
      const claimId = '123';
      const gaId = '456';
      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      const response = new GaResponse();
      response.additionalText = 'More info';
      (getClaimById as jest.Mock).mockResolvedValueOnce(claim);
      (getCancelUrl as jest.Mock).mockResolvedValue('/cancel-url');
      (buildSummarySection as jest.Mock).mockReturnValue([]);
      (getGADocumentsFromDraftStore as jest.Mock).mockReturnValue(uploadDocuments);
      (getDraftGARespondentResponse as jest.Mock).mockReturnValue(response);

      const res = await request(app).get(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CYA_URL));

      expect(res.status).toBe(200);
      expect(getCancelUrl).toHaveBeenCalledWith(claimId, claim);
      expect(buildSummarySection).toHaveBeenCalledWith(response.additionalText, uploadDocuments, claimId, gaId, undefined);
      expect(res.text).toContain('Check your answers');
    });

    it('should handle errors', async () => {
      const claimId = '123';
      const gaId = '456';
      (getClaimById as jest.Mock).mockRejectedValue(new Error('Error'));

      const res = await request(app).get(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CYA_URL));

      expect(res.status).toBe(500);
    });
  });

  describe('POST /chec-and-send', () => {
    it('should submit the documents and redirect to submitted page', async () => {
      const claimId = '123';
      const gaId = '456';
      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      const response = new GaResponse();
      (translateCUItoCCD as jest.Mock).mockReturnValue([]);
      (getGADocumentsFromDraftStore as jest.Mock).mockReturnValue(uploadDocuments);
      (getDraftGARespondentResponse as jest.Mock).mockReturnValue(response);
      const mockGaServiceClient = jest.spyOn(GaServiceClient.prototype, 'submitEvent').mockResolvedValueOnce(undefined);

      const res = await request(app).post(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CYA_URL));

      expect(res.status).toBe(302);
      expect(res.header.location).toBe(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CONFIRMATION_URL));
      expect(translateCUItoCCD).toHaveBeenCalledWith(uploadDocuments);
      expect(mockGaServiceClient).toHaveBeenCalledWith(ApplicationEvent.RESPOND_TO_JUDGE_ADDITIONAL_INFO, gaId, { generalAppAddlnInfoUpload: [] }, expect.anything());
    });

    it('should handle errors', async () => {
      const claimId = '123';
      const gaId = '456';
      (getClaimById as jest.Mock).mockRejectedValue(new Error('Error'));

      const res = await request(app).post(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CYA_URL)).send({});

      expect(res.status).toBe(500);
    });
  });
});
