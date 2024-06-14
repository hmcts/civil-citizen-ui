import * as requestModels from 'models/AppRequest';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {GA_APPLY_HELP_WITH_FEES} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getRedirectUrl} from 'services/features/generalApplication/applicationFee/helpWithApplicationFeeService';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');

declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
const claimId = '1';

describe('apply help with application fee selection', () => {
  // it('should return test url if applyHelpWithFees option is No', async () => {
  //   //when
  //   const actualRedirectUrl = await getRedirectUrl(claimId, new GenericYesNo(YesNo.NO), mockedAppRequest);
  //   //Then
  //   expect(actualRedirectUrl).toBe(constructResponseUrlWithIdParams(claimId, 'test'));
  // });

  it('should return - Do you want to continue to apply for Help with Fees page if applyHelpWithFees option is yes', async () => {
    //when
    const actualRedirectUrl = await getRedirectUrl(claimId, new GenericYesNo(YesNo.YES), mockedAppRequest);
    //Then
    expect(actualRedirectUrl).toBe(constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_WITH_FEES));
  });
});
