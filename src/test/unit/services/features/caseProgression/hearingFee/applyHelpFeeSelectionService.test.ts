import {CivilServiceClient} from 'client/civilServiceClient';
import {getRedirectUrl} from 'services/features/caseProgression/hearingFee/applyHelpFeeSelectionService';
import * as requestModels from 'models/AppRequest';
import {GenericYesNo} from 'form/models/genericYesNo';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {app} from '../../../../../../main/app';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';
import {YesNo} from 'form/models/yesNo';
import {APPLY_HELP_WITH_FEES} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

jest.mock('modules/draft-store');
jest.mock('modules/draft-store/courtLocationCache');
jest.mock('services/features/directionsQuestionnaire/directionQuestionnaireService');

declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
const claimId = '1';

describe('applyHelpWithFeeSelection', () => {
  app.locals.draftStoreClient = mockCivilClaim;
  jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  it('should return gov pay url if user selects No', async () => {
    const mockHearingFeePaymentRedirectInfo = {
      status: 'initiated',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
    };
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentRedirectInformation').mockResolvedValueOnce(mockHearingFeePaymentRedirectInfo);
    //when
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, new GenericYesNo(YesNo.NO), mockedAppRequest);

    //Then
    expect(actualPaymentRedirectUrl).toBe(mockHearingFeePaymentRedirectInfo.nextUrl);
  });

  it('should return Apply help with fees start url if user selects Yes', async () => {
    //when
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, new GenericYesNo(YesNo.YES), mockedAppRequest);

    //Then
    expect(actualPaymentRedirectUrl).toBe(constructResponseUrlWithIdParams(claimId, APPLY_HELP_WITH_FEES));
  });
});
