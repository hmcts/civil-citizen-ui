import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {GaServiceClient} from 'client/gaServiceClient';
import {
  getGaFeePaymentRedirectInformation, getGaFeePaymentStatus,
} from 'services/features/generalApplication/applicationFee/generalApplicationFeePaymentService';
import * as requestModels from 'models/AppRequest';

declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
const claimId = '1';

describe('General Application Fee Payment Service Service', () => {
  describe('getGaFeePaymentRedirectInformation', () => {
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
    it('should return General Application Payment Redirect Information', async () => {
      const mockHearingFeePaymentRedirectInfo = {
        status: 'initiated',
        nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      };
      jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentRedirectInformation').mockResolvedValueOnce(mockHearingFeePaymentRedirectInfo);
      //when
      const actualPaymentRedirectInformation = await getGaFeePaymentRedirectInformation(claimId,'en' ,mockedAppRequest);

      //Then
      expect(actualPaymentRedirectInformation).toBe(mockHearingFeePaymentRedirectInfo);
    });

    it('should return 500 error page for any service error', async () => {
      jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentRedirectInformation').mockRejectedValueOnce(TestMessages.SOMETHING_WENT_WRONG);

      //Then
      await expect(getGaFeePaymentRedirectInformation(claimId, 'en', mockedAppRequest)).rejects.toBe(
        TestMessages.SOMETHING_WENT_WRONG,
      );
    });
  });

  describe('getGaFeePaymentStatus', () => {
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
    const mockFeePaymentSatatusInfo = {
      status: 'initiated',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference: 'RC-1701-0909-0602-0418',
    };
    it('should return Payment status information', async () => {
      jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentStatus').mockResolvedValueOnce(mockFeePaymentSatatusInfo);
      //when
      const actualPaymentStatusInformation = await getGaFeePaymentStatus('1', mockFeePaymentSatatusInfo.paymentReference, mockedAppRequest);

      //Then
      expect(actualPaymentStatusInformation).toBe(mockFeePaymentSatatusInfo);
    });

    it('should return 500 error page for any service error', async () => {
      jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentStatus').mockRejectedValueOnce(TestMessages.SOMETHING_WENT_WRONG);
      //Then
      await expect(getGaFeePaymentStatus('1', mockFeePaymentSatatusInfo.paymentReference, mockedAppRequest)).rejects.toBe(
        TestMessages.SOMETHING_WENT_WRONG,
      );
    });
  });
});
