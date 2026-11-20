jest.mock('../../../../../../main/app', () => jest.requireActual('../../../../../utils/getRouteHandler'));
jest.mock('../../../../../../main/app-instance', () => jest.requireActual('../../../../../utils/getRouteHandler'));

import { app } from '../../../../../../main/app-instance';
import { GaResponse } from 'common/models/generalApplication/response/gaResponse';
import {
  saveDraftGARespondentResponse,
  getDraftGARespondentResponse,
  deleteDraftGARespondentResponseFromStore,
} from 'services/features/generalApplication/response/generalApplicationResponseStoreService';

const mockDraftStoreClient = {
  set: jest.fn(),
  ttl: jest.fn(),
  expireat: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
};
const redisKey = 'test-key';
let response: GaResponse;

describe('draftStoreService', () => {
  beforeEach(() => {
    Object.values(mockDraftStoreClient).forEach(mock => mock.mockReset());
    app.locals.draftStoreClient = mockDraftStoreClient;
    mockDraftStoreClient.ttl.mockResolvedValue(-1);
    response = new GaResponse();
    response.draftResponseCreatedAt = new Date();
  });

  describe('saveDraftGARespondentResponse', () => {
    it('should save the draft response and set expiration', async () => {
      mockDraftStoreClient.set.mockResolvedValueOnce(null);

      await saveDraftGARespondentResponse(redisKey, response);
      const stringfyData = JSON.stringify(response);
      expect(mockDraftStoreClient.set).toHaveBeenCalledWith(redisKey, stringfyData, 'EX', expect.any(Number));
      expect(mockDraftStoreClient.expireat).not.toHaveBeenCalled();
    });

    it('should propagate the original error when saving a respondent response fails', async () => {
      const error = new Error('GA respondent response save failed');
      mockDraftStoreClient.set.mockRejectedValueOnce(error);

      await expect(saveDraftGARespondentResponse(redisKey, response)).rejects.toBe(error);

      expect(mockDraftStoreClient.set).toHaveBeenCalledTimes(1);
      expect(mockDraftStoreClient.set).toHaveBeenCalledWith(redisKey, JSON.stringify(response), 'EX', expect.any(Number));
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

  describe('deleteDraftGARespondentResponseFromStore', () => {
    it('should delete only the requested respondent response key', async () => {
      mockDraftStoreClient.del.mockResolvedValueOnce(1);

      await deleteDraftGARespondentResponseFromStore(redisKey);

      expect(mockDraftStoreClient.del).toHaveBeenCalledTimes(1);
      expect(mockDraftStoreClient.del).toHaveBeenCalledWith(redisKey);
    });
  });
});
