import {getRedirectUrl} from 'services/features/caseProgression/hearingFee/makePaymentAgainService';
import * as requestModels from 'models/AppRequest';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {app} from '../../../../../../main/app';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {AppRequest} from 'models/AppRequest';
import {getRedirectUrlCommon} from 'services/features/caseProgression/hearingFee/paymentServiceUtils';

jest.mock('common/utils/urlFormatter');
jest.mock('services/features/caseProgression/hearingFee/paymentServiceUtils');

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

declare const appRequest: requestModels.AppRequest;
const claimId = '1';
const mockAppRequest = {
  session: {user: {id: 'userId'}},
  params: {id: claimId},
} as unknown as AppRequest;

describe('MakePaymentAgain Service', () => {
  app.locals.draftStoreClient = mockCivilClaim;
  jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  it('should return gov pay url', async () => {
    const mockHearingFeePaymentRedirectInfo = {
      status: 'initiated',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
    };
    (getRedirectUrlCommon as jest.Mock).mockResolvedValue(mockHearingFeePaymentRedirectInfo.nextUrl);
    //when
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, mockAppRequest);

    //Then
    expect(actualPaymentRedirectUrl).toBe(mockHearingFeePaymentRedirectInfo.nextUrl);
  });

  it('should return 500 error page for any service error', async () => {
    (getRedirectUrlCommon as jest.Mock).mockRejectedValueOnce(TestMessages.SOMETHING_WENT_WRONG);

    //Then
    await expect(getRedirectUrl(claimId, mockAppRequest)).rejects.toBe(
      TestMessages.SOMETHING_WENT_WRONG,
    );
  });

});
