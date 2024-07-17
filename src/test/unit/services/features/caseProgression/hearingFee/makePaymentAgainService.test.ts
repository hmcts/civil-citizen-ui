import {CivilServiceClient} from 'client/civilServiceClient';
import {getRedirectUrl} from 'services/features/caseProgression/hearingFee/makePaymentAgainService';
import * as requestModels from 'models/AppRequest';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {civilClaimResponseMock} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/draft-store/courtLocationCache');
jest.mock('services/features/directionsQuestionnaire/directionQuestionnaireService');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
const claimId = '1';

describe('MakePaymentAgain Service', () => {
  mockGetCaseData.mockImplementation(async () => {
    return Object.assign(new Claim(), civilClaimResponseMock.case_data);
  });
  jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  it('should return gov pay url', async () => {
    const mockHearingFeePaymentRedirectInfo = {
      status: 'initiated',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
    };
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentRedirectInformation').mockResolvedValueOnce(mockHearingFeePaymentRedirectInfo);
    //when
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, mockedAppRequest);

    //Then
    expect(actualPaymentRedirectUrl).toBe(mockHearingFeePaymentRedirectInfo.nextUrl);
  });

  it('should return 500 error page for any service error', async () => {
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentRedirectInformation').mockRejectedValueOnce(TestMessages.SOMETHING_WENT_WRONG);

    //Then
    await expect(getRedirectUrl(claimId, mockedAppRequest)).rejects.toBe(
      TestMessages.SOMETHING_WENT_WRONG,
    );
  });

});
