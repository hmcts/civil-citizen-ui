import config from 'config';
import nock from 'nock';
import request from 'supertest';
import { app } from '../../../../../../../main/app';
import { isGaForLipsEnabled } from 'app/auth/launchdarkly/launchDarklyClient';
import { buildSummarySectionForAdditionalDoc, getClaimDetailsById, prepareCCDData } from 'services/features/generalApplication/additionalDocumentService';
import { getCancelUrl } from 'services/features/generalApplication/generalApplicationService';
import { GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL, GA_UPLOAD_ADDITIONAL_DOCUMENTS_SUBMITTED_URL } from 'routes/urls';
import { Claim } from 'common/models/claim';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { GaServiceClient } from 'client/gaServiceClient';
import { ApplicationEvent } from 'common/models/gaEvents/applicationEvent';
import { constructResponseUrlWithIdAndAppIdParams } from 'common/utils/urlFormatter';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../../main/services/features/generalApplication/additionalDocumentService', () => ({
  getClaimDetailsById: jest.fn(),
  prepareCCDData: jest.fn(),
  buildSummarySectionForAdditionalDoc: jest.fn(),
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

  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('GET check your answers', () => {
    it('should render the check answers page with correct data', async () => {
      const claimId = '123';
      const gaId = '456';
      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      (getClaimDetailsById as jest.Mock).mockResolvedValue(claim);
      (getCancelUrl as jest.Mock).mockResolvedValue('/cancel-url');
      (buildSummarySectionForAdditionalDoc as jest.Mock).mockReturnValue([]);

      const res = await request(app).get(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL));

      expect(res.status).toBe(200);
      expect(getClaimDetailsById).toHaveBeenCalledWith(expect.anything());
      expect(getCancelUrl).toHaveBeenCalledWith(claimId, claim);
      expect(buildSummarySectionForAdditionalDoc).toHaveBeenCalledWith(claim.generalApplication.uploadAdditionalDocuments, claimId, gaId, undefined);
      expect(res.text).toContain('Check your answers');
    });

    it('should render the check answers welsh page with correct data', async () => {
      const claimId = '123';
      const gaId = '456';
      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      (getClaimDetailsById as jest.Mock).mockResolvedValue(claim);
      (getCancelUrl as jest.Mock).mockResolvedValue('/cancel-url');
      (buildSummarySectionForAdditionalDoc as jest.Mock).mockReturnValue([]);

      const res = await request(app).get(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL)).query({lang: 'cy'});

      expect(res.status).toBe(200);
      expect(getClaimDetailsById).toHaveBeenCalledWith(expect.anything());
      expect(getCancelUrl).toHaveBeenCalledWith(claimId, claim);
      expect(buildSummarySectionForAdditionalDoc).toHaveBeenCalledWith(claim.generalApplication.uploadAdditionalDocuments, claimId, gaId, 'cy');
      expect(res.text).toContain('Gwirio eich atebion');
    });

    it('should handle errors', async () => {
      const claimId = '123';
      const gaId = '456';
      (getClaimDetailsById as jest.Mock).mockRejectedValue(new Error('Error'));

      const res = await request(app).get(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL));

      expect(res.status).toBe(500);
    });
  });

  describe('POST /ga-upload-additional-documents-cya', () => {
    it('should submit the documents and redirect to submitted page', async () => {
      const claimId = '123';
      const gaId = '456';
      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      (getClaimDetailsById as jest.Mock).mockResolvedValue(claim);
      (prepareCCDData as jest.Mock).mockReturnValue([]);
      const mockGaServiceClient = jest.spyOn(GaServiceClient.prototype, 'submitEvent').mockResolvedValueOnce(undefined);

      const res = await request(app).post(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL));

      expect(res.status).toBe(302);
      expect(res.header.location).toBe(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_SUBMITTED_URL));
      expect(getClaimDetailsById).toHaveBeenCalledWith(expect.anything());
      expect(prepareCCDData).toHaveBeenCalledWith(claim.generalApplication.uploadAdditionalDocuments);
      expect(mockGaServiceClient).toHaveBeenCalledWith(ApplicationEvent.UPLOAD_ADDL_DOCUMENTS, gaId, { uploadDocument: [] }, expect.anything());
    });

    it('should handle errors', async () => {
      const claimId = '123';
      const gaId = '456';
      (getClaimDetailsById as jest.Mock).mockRejectedValue(new Error('Error'));

      const res = await request(app).post(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL)).send({});

      expect(res.status).toBe(500);
    });
  });
});
