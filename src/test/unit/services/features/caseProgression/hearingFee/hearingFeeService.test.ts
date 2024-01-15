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
    const mockClaim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
    const testClaim = {
      ...mockClaim,
      case_data: {
        ...mockClaim.case_data,
        isClaimant: jest.fn(),
      },
    };
    //when
    await triggerNotifyEvent(mockClaimId, null, testClaim.case_data);
    //Then
    expect(spyTriggerEvent).toHaveBeenCalled();
    expect(spyTriggerEvent).toHaveBeenCalledWith('APPLY_HELP_WITH_HEARING_FEE', mockClaimId, {'hearingHelpFeesReferenceNumber': '12345678901'}, null);
  });

  it('should trigger notify event with no respondent data', async () => {
    //Given
    const spyTriggerEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
    const mockClaim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
    const testClaim = {
      ...mockClaim,
      case_data: {
        ...mockClaim.case_data,
        isClaimant: jest.fn(),
      },
    };
    //when
    await triggerNotifyEvent(mockClaimId, null, testClaim);
    //Then
    expect(spyTriggerEvent).toHaveBeenCalled();
    expect(spyTriggerEvent).toHaveBeenCalledWith('APPLY_HELP_WITH_HEARING_FEE', mockClaimId, {'hearingHelpFeesReferenceNumber': undefined}, null);
  });
});
