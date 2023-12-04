import {CivilServiceClient} from 'client/civilServiceClient';
import * as requestModels from 'models/AppRequest';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {getFeePaymentRedirectInformation} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';

declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
const claimId = '1';

describe('Fee Payment Service Service', () => {
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
