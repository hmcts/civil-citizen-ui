import {app} from '../../../../main/app';
import {GaHelpWithFees} from 'models/generalApplication/gaHelpWithFees';
import {getDraftGAHWFDetails, saveDraftGAHWFDetails} from 'modules/draft-store/gaHwFeesDraftStore';
import {YesNo} from 'form/models/yesNo';

const mockDraftStoreClient = {
  set: jest.fn(),
  expireat: jest.fn(),
  get: jest.fn(),
};
app.locals.draftStoreClient = mockDraftStoreClient;

const redisKey = 'test-key';
const gaHelpWithFees = new GaHelpWithFees();

describe('GA Hwf Store Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveDraftGAHWFDetails', () => {
    it('should save the draft Hwf details', async () => {
      mockDraftStoreClient.set.mockResolvedValueOnce(null);
      mockDraftStoreClient.expireat.mockResolvedValueOnce(null);

      await saveDraftGAHWFDetails(redisKey, gaHelpWithFees);
      const stringfyData = JSON.stringify(gaHelpWithFees);
      expect(mockDraftStoreClient.set).toHaveBeenCalledWith(redisKey, stringfyData);
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
