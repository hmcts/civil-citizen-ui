import * as requestModels from 'models/AppRequest';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {GA_APPLY_HELP_WITH_FEES} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getRedirectUrl} from 'services/features/generalApplication/applicationFee/helpWithApplicationFeeService';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {CivilServiceClient} from 'client/civilServiceClient';
import {GaServiceClient} from 'client/gaServiceClient';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
const claimId = '1';
const nextUrl= 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960';

describe('apply help with application fee selection', () => {
  it('should return test url if applyHelpWithFees option is No', async () => {
    //given
    const claim = new Claim();
    claim.generalApplication = new GeneralApplication();
    const ccdClaim = new Claim();
    ccdClaim.generalApplications =
      [
        {
          'id': 'test',
          'value': {
            'caseLink': {
              'CaseReference': 'testApp1',
            },
          },
        },
      ];
    (getClaimById as jest.Mock).mockResolvedValueOnce(claim);
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValueOnce(ccdClaim);
    const mockClaimFeePaymentRedirectInfo = {
      status: 'initiated',
      nextUrl: nextUrl,
    };
    jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentRedirectInformation').mockResolvedValueOnce(mockClaimFeePaymentRedirectInfo);

    //when
    const actualRedirectUrl = await getRedirectUrl(claimId, new GenericYesNo(YesNo.NO), mockedAppRequest);
    //Then
    expect(actualRedirectUrl).toBe(constructResponseUrlWithIdParams(claimId, nextUrl));
  });

  it('should return - Do you want to continue to apply for Help with Fees page if applyHelpWithFees option is yes', async () => {
    //when
    const actualRedirectUrl = await getRedirectUrl(claimId, new GenericYesNo(YesNo.YES), mockedAppRequest);
    //Then
    expect(actualRedirectUrl).toBe(constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_WITH_FEES));
  });
});
