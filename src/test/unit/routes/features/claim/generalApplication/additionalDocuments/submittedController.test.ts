import config from 'config';
import nock from 'nock';
import request from 'supertest';
import { app } from '../../../../../../../main/app';
import { isGaForLipsEnabled } from 'app/auth/launchdarkly/launchDarklyClient';
import { getClaimById } from 'modules/utilityService';
import { deleteDraftClaimFromStore, generateRedisKey } from 'modules/draft-store/draftStoreService';
import { getCancelUrl } from 'services/features/generalApplication/generalApplicationService';
import { GA_UPLOAD_ADDITIONAL_DOCUMENTS_SUBMITTED_URL } from 'routes/urls';
import { Claim } from 'common/models/claim';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../..../../../../../../main/modules/utilityService');
jest.mock('../../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn((key) => key),
  deleteDraftClaimFromStore: jest.fn((key) => { key; }),
}));
jest.mock('../../../../../../../main/services/features/generalApplication/generalApplicationService', () => ({
  getCancelUrl: jest.fn(),
}));

describe('General Application - additional docs submitted controller', () => {
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
  describe('GET submit controller', () => {
    it('should render the submitted page with correct data', async () => {
      const claimId = '123';
      const claim = new Claim();
      const redisKey = 'redis-key';
      const cancelUrl = '/cancel-url';

      (getClaimById as jest.Mock).mockResolvedValue(claim);
      (generateRedisKey as jest.Mock).mockReturnValue(redisKey);
      (deleteDraftClaimFromStore as jest.Mock).mockResolvedValue(undefined);
      (getCancelUrl as jest.Mock).mockResolvedValue(cancelUrl);

      const res = await request(app).get(GA_UPLOAD_ADDITIONAL_DOCUMENTS_SUBMITTED_URL.replace(':id', claimId));

      expect(res.status).toBe(200);
      expect(getClaimById).toHaveBeenCalledWith(claimId, expect.anything(), true);
      expect(generateRedisKey).toHaveBeenCalledWith(expect.anything());
      expect(deleteDraftClaimFromStore).toHaveBeenCalledWith(redisKey);
      expect(getCancelUrl).toHaveBeenCalledWith(claimId, claim);
      expect(res.text).toContain('You\'ve uploaded additional documents');
    });

    it('should handle errors', async () => {
      (getClaimById as jest.Mock).mockRejectedValue(new Error('Error'));

      const res = await request(app).get(GA_UPLOAD_ADDITIONAL_DOCUMENTS_SUBMITTED_URL.replace(':id', '123'));

      expect(res.status).toBe(500);
    });
  });
});