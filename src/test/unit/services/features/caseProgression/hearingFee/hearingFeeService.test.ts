import {triggerNotifyEvent} from 'services/features/caseProgression/hearingFee/hearingFeeService';
import {CivilServiceClient} from 'client/civilServiceClient';

jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('services/translation/claim/ccdTranslation');
jest.mock('client/civilServiceClient');

describe('hearing Fee service', () => {

  const mockClaimId = '1645882162449409';
  it('should trigger notify event', async () => {
    //Given
    const spyTriggerEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
    //when
    await triggerNotifyEvent(mockClaimId, null, 'abc');
    //Then
    expect(spyTriggerEvent).toHaveBeenCalled();
    expect(spyTriggerEvent).toHaveBeenCalledWith('NOTIFY_CLAIMANT_LIP_HELP_WITH_FEES', mockClaimId, undefined, null);
  });
});
