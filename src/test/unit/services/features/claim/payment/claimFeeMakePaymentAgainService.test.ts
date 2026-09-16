import {CivilServiceClient} from 'client/civilServiceClient';
import {getRedirectUrl} from 'services/features/claim/payment/claimFeeMakePaymentAgainService';
import * as requestModels from 'models/AppRequest';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {app} from '../../../../../../main/app';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {Claim} from 'models/claim';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {PaymentInformation} from 'models/feePayment/paymentInformation';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import Mock = jest.Mock;

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
const claimId = '12345';

describe('ClaimFeeMakePaymentAgain Service', () => {
  app.locals.draftStoreClient = mockCivilClaim;
  jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  it('should update with payment reference on generation of payment link', async () => {
    const mockClaim = new Claim();
    mockClaim.claimDetails = new ClaimDetails();
    mockClaim.claimDetails.claimFeePayment = new PaymentInformation('1234', 'RC-1701-0909-0602-0417');
    const mockClaimFeePaymentRedirectInfo = {
      status: 'initiated',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      paymentReference: 'RC-1701-0909-0602-0418',
    };
    (getCaseDataFromStore as Mock).mockResolvedValue(mockClaim);
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentRedirectInformation').mockResolvedValueOnce(mockClaimFeePaymentRedirectInfo);

    //when
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, mockedAppRequest);
    //Then
    expect(actualPaymentRedirectUrl).toBe(mockClaimFeePaymentRedirectInfo.nextUrl);
    expect(mockClaim.claimDetails.claimFeePayment).toEqual(mockClaimFeePaymentRedirectInfo);
  });

  it('should return 500 error page for any service error', async () => {
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentRedirectInformation').mockRejectedValueOnce(TestMessages.SOMETHING_WENT_WRONG);

    //Then
    await expect(getRedirectUrl(claimId, mockedAppRequest)).rejects.toBe(
      TestMessages.SOMETHING_WENT_WRONG,
    );
  });

});
