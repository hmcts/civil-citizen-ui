jest.mock('../../../../main/app-instance', () => jest.requireActual('../../../utils/getRouteHandler'));

import {app} from '../../../../main/app-instance';
import {GaHelpWithFees} from 'models/generalApplication/gaHelpWithFees';
import {getDraftGAHWFDetails, saveDraftGAHWFDetails} from 'modules/draft-store/gaHwFeesDraftStore';
import {YesNo} from 'form/models/yesNo';

const mockDraftStoreClient = {
  set: jest.fn(),
  ttl: jest.fn(),
  expireat: jest.fn(),
  get: jest.fn(),
};
const redisKey = 'test-key';
let gaHelpWithFees: GaHelpWithFees;

describe('GA Hwf Store Service', () => {
  beforeEach(() => {
    Object.values(mockDraftStoreClient).forEach(mock => mock.mockReset());
    app.locals.draftStoreClient = mockDraftStoreClient;
    mockDraftStoreClient.ttl.mockResolvedValue(-1);
    gaHelpWithFees = new GaHelpWithFees();
  });

  describe('saveDraftGAHWFDetails', () => {
    it('should save the draft Hwf details with TTL', async () => {
      mockDraftStoreClient.set.mockResolvedValueOnce(null);

      await saveDraftGAHWFDetails(redisKey, gaHelpWithFees);
      const stringfyData = JSON.stringify(gaHelpWithFees);
      expect(mockDraftStoreClient.set).toHaveBeenCalledWith(redisKey, stringfyData, 'EX', expect.any(Number));
      expect(mockDraftStoreClient.expireat).not.toHaveBeenCalled();
    });

    it('should propagate the original error when saving HWF details fails', async () => {
      const error = new Error('GA HWF save failed');
      mockDraftStoreClient.set.mockRejectedValueOnce(error);

      await expect(saveDraftGAHWFDetails(redisKey, gaHelpWithFees)).rejects.toBe(error);

      expect(mockDraftStoreClient.set).toHaveBeenCalledTimes(1);
      expect(mockDraftStoreClient.set).toHaveBeenCalledWith(redisKey, JSON.stringify(gaHelpWithFees), 'EX', expect.any(Number));
    });
  });

  describe('gaHelpWithFees', () => {
    it('should return the draft response from Redis', async () => {
      const mockGAHwF = new GaHelpWithFees();
      mockGAHwF.applyHelpWithFees = {option: YesNo.YES};
      const dataFromRedis = JSON.stringify(mockGAHwF);
      mockDraftStoreClient.get.mockResolvedValueOnce(dataFromRedis);

      const result = await getDraftGAHWFDetails(redisKey);

      expect(mockDraftStoreClient.get).toHaveBeenCalledWith(redisKey);
      expect(result).toEqual(mockGAHwF);
    });

    it('should return an empty GaResponse object if data is not available', async () => {
      mockDraftStoreClient.get.mockResolvedValueOnce(null);

      const result = await getDraftGAHWFDetails(redisKey);

      expect(mockDraftStoreClient.get).toHaveBeenCalledWith(redisKey);
      expect(result).toEqual(expect.any(GaHelpWithFees));
    });
  });
});
