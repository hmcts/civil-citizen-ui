import {CivilServiceClient} from 'client/civilServiceClient';
import * as requestModels from 'models/AppRequest';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {getFeePaymentRedirectInformation, getFeePaymentStatus} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';

declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
const claimId = '1';

describe('Fee Payment Service Service', () => {
  describe('getFeePaymentRedirectInformation', () => {
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
    it('should return Payment Redirect Information', async () => {
      const mockHearingFeePaymentRedirectInfo = {
        status: 'initiated',
        nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      };
      jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentRedirectInformation').mockResolvedValueOnce(mockHearingFeePaymentRedirectInfo);
      //when
      const actualPaymentRedirectInformation = await getFeePaymentRedirectInformation(claimId, FeeType.HEARING, mockedAppRequest);

      //Then
      expect(actualPaymentRedirectInformation).toBe(mockHearingFeePaymentRedirectInfo);
    });

    it('should return 500 error page for any service error', async () => {
      jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentRedirectInformation').mockRejectedValueOnce(TestMessages.SOMETHING_WENT_WRONG);

      //Then
      await expect(getFeePaymentRedirectInformation(claimId, FeeType.HEARING, mockedAppRequest)).rejects.toBe(
        TestMessages.SOMETHING_WENT_WRONG,
      );
    });
  });

  describe('getFeePaymentStatus', () => {
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
    const mockHearingFeePaymentSatatusInfo = {
      status: 'initiated',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference: 'RC-1701-0909-0602-0418',
    };
    it('should return Payment status information', async () => {
      jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentStatus').mockResolvedValueOnce(mockHearingFeePaymentSatatusInfo);
      //when
      const actualPaymentStatusInformation = await getFeePaymentStatus('1', mockHearingFeePaymentSatatusInfo.paymentReference, FeeType.HEARING, mockedAppRequest);

      //Then
      expect(actualPaymentStatusInformation).toBe(mockHearingFeePaymentSatatusInfo);
    });

    it('should return 500 error page for any service error', async () => {
      jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentStatus').mockRejectedValueOnce(TestMessages.SOMETHING_WENT_WRONG);
      //Then
      await expect(getFeePaymentStatus('1', mockHearingFeePaymentSatatusInfo.paymentReference, FeeType.HEARING, mockedAppRequest)).rejects.toBe(
        TestMessages.SOMETHING_WENT_WRONG,
      );
    });
  });
});
