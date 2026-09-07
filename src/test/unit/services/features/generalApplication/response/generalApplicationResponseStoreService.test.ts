import { app } from '../../../../../../main/app';
import { GaResponse } from 'common/models/generalApplication/response/gaResponse';
import { saveDraftGARespondentResponse, getDraftGARespondentResponse } from 'services/features/generalApplication/response/generalApplicationResponseStoreService';// import { saveDraftGARespondentResponse, getDraftGARespondentResponse } from './path/to/draftStoreService';

const mockDraftStoreClient = {
  set: jest.fn(),
  ttl: jest.fn(),
  expireat: jest.fn(),
  get: jest.fn(),
};
app.locals.draftStoreClient = mockDraftStoreClient;

const redisKey = 'test-key';
const response = new GaResponse();
response.draftResponseCreatedAt = new Date();

describe('draftStoreService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDraftStoreClient.ttl.mockResolvedValue(-1);
  });

  describe('saveDraftGARespondentResponse', () => {
    it('should save the draft response and set expiration', async () => {
      mockDraftStoreClient.set.mockResolvedValueOnce(null);

      await saveDraftGARespondentResponse(redisKey, response);
      const stringfyData = JSON.stringify(response);
      expect(mockDraftStoreClient.set).toHaveBeenCalledWith(redisKey, stringfyData, 'EX', expect.any(Number));
      expect(mockDraftStoreClient.expireat).not.toHaveBeenCalled();
    });

    it('should set draftResponseCreatedAt and expiry when creation date is missing', async () => {
      const responseWithoutCreatedAt = new GaResponse();

      await saveDraftGARespondentResponse(redisKey, responseWithoutCreatedAt);

      expect(responseWithoutCreatedAt.draftResponseCreatedAt).toBeDefined();
      expect(mockDraftStoreClient.set).toHaveBeenCalledWith(redisKey, expect.any(String), 'EX', expect.any(Number));
      expect(mockDraftStoreClient.expireat).not.toHaveBeenCalled();
    });

    it('should preserve existing TTL on update', async () => {
      mockDraftStoreClient.ttl.mockResolvedValueOnce(600);

      await saveDraftGARespondentResponse(redisKey, response);

      expect(mockDraftStoreClient.set).toHaveBeenCalledWith(redisKey, JSON.stringify(response), 'KEEPTTL');
      expect(mockDraftStoreClient.expireat).not.toHaveBeenCalled();
    });
  });

  describe('getDraftGARespondentResponse', () => {
    it('should return the draft response from Redis', async () => {
      const dataFromRedis = JSON.stringify(response);
      mockDraftStoreClient.get.mockResolvedValueOnce(dataFromRedis);

      const result = await getDraftGARespondentResponse(redisKey);

      expect(mockDraftStoreClient.get).toHaveBeenCalledWith(redisKey);
      expect(result).toEqual(expect.any(GaResponse));
    });

    it('should return an empty GaResponse object if data is not available', async () => {
      mockDraftStoreClient.get.mockResolvedValueOnce(null);

      const result = await getDraftGARespondentResponse(redisKey);

      expect(mockDraftStoreClient.get).toHaveBeenCalledWith(redisKey);
      expect(result).toEqual(expect.any(GaResponse));
    });
  });
});
