import config from 'config';
import nock from 'nock';
import request from 'supertest';
import { isGaForLipsEnabled } from 'app/auth/launchdarkly/launchDarklyClient';
import {getCancelUrl, getClaimDetailsById} from 'services/features/generalApplication/generalApplicationService';
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
  translateCUItoCCD,
} from 'services/features/generalApplication/additionalInfoUpload/uploadDocumentsForReqMoreInfoService';
import {app} from '../../../../../../../main/app';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../../main/services/features/generalApplication/additionalInfoUpload/uploadDocumentsForReqMoreInfoService', () => ({
  translateCUItoCCD: jest.fn(),
  buildSummarySection: jest.fn(),
}));
jest.mock('../../../../../../../main/services/features/generalApplication/generalApplicationService', () => ({
  getCancelUrl: jest.fn(),
  getClaimDetailsById: jest.fn(),
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
      (buildSummarySection as jest.Mock).mockReturnValue([]);

      const res = await request(app).get(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CYA_URL));

      expect(res.status).toBe(200);
      expect(getClaimDetailsById).toHaveBeenCalledWith(expect.anything());
      expect(getCancelUrl).toHaveBeenCalledWith(claimId, claim);
      expect(buildSummarySection).toHaveBeenCalledWith(claim.generalApplication.generalAppAddlnInfoUpload, claimId, gaId, undefined);
      expect(res.text).toContain('Check your answers');
    });

    it('should handle errors', async () => {
      const claimId = '123';
      const gaId = '456';
      (getClaimDetailsById as jest.Mock).mockRejectedValue(new Error('Error'));

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
      (getClaimDetailsById as jest.Mock).mockResolvedValue(claim);
      (translateCUItoCCD as jest.Mock).mockReturnValue([]);
      const mockGaServiceClient = jest.spyOn(GaServiceClient.prototype, 'submitEvent').mockResolvedValueOnce(undefined);

      const res = await request(app).post(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CYA_URL));

      expect(res.status).toBe(302);
      expect(res.header.location).toBe(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CONFIRMATION_URL));
      expect(getClaimDetailsById).toHaveBeenCalledWith(expect.anything());
      expect(translateCUItoCCD).toHaveBeenCalledWith(claim.generalApplication.generalAppAddlnInfoUpload);
      expect(mockGaServiceClient).toHaveBeenCalledWith(ApplicationEvent.RESPOND_TO_JUDGE_ADDITIONAL_INFO, gaId, { generalAppAddlnInfoUpload: [] }, expect.anything());
    });

    it('should handle errors', async () => {
      const claimId = '123';
      const gaId = '456';
      (getClaimDetailsById as jest.Mock).mockRejectedValue(new Error('Error'));

      const res = await request(app).post(constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CYA_URL)).send({});

      expect(res.status).toBe(500);
    });
  });
});
