import config from 'config';
import nock from 'nock';
import request from 'supertest';
import { app } from '../../../../../../../main/app';
import { isGaForLipsEnabled } from 'app/auth/launchdarkly/launchDarklyClient';
import { getClaimById } from 'modules/utilityService';
import {
  deleteDraftClaimFromStore,
  generateRedisKeyForGA,
} from 'modules/draft-store/draftStoreService';
import { Claim } from 'common/models/claim';
import {GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_CONFIRMATION_URL} from 'routes/urls';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../..../../../../../../main/modules/utilityService');
jest.mock('../../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService', () => ({
  generateRedisKeyForGA: jest.fn((key) => key),
  deleteDraftClaimFromStore: jest.fn((key) => { key; }),
}));

describe('General Application - Request More Information Confirmation', () => {
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

      (getClaimById as jest.Mock).mockResolvedValue(claim);
      (generateRedisKeyForGA as jest.Mock).mockReturnValue(redisKey);
      (deleteDraftClaimFromStore as jest.Mock).mockResolvedValue(undefined);

      const res = await request(app).get(GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_CONFIRMATION_URL.replace(':id', claimId));

      expect(res.status).toBe(200);
      expect(getClaimById).toHaveBeenCalledWith(claimId, expect.anything(), true);
      expect(generateRedisKeyForGA).toHaveBeenCalledWith(expect.anything());
      expect(deleteDraftClaimFromStore).toHaveBeenCalledWith(redisKey);
      expect(res.text).toContain('uploaded additional documents');
    });

    it('should handle errors', async () => {
      (getClaimById as jest.Mock).mockRejectedValue(new Error('Error'));

      const res = await request(app).get(GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_CONFIRMATION_URL.replace(':id', '123'));

      expect(res.status).toBe(500);
    });
  });
});
