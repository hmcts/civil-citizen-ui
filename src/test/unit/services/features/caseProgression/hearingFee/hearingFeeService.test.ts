import {triggerNotifyEvent} from 'services/features/caseProgression/hearingFee/hearingFeeService';
import {CivilServiceClient} from 'client/civilServiceClient';
import {YesNo} from 'form/models/yesNo';
import {ApplyHelpFeesReferenceForm} from 'form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm';

jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('services/translation/claim/ccdTranslation');
jest.mock('client/civilServiceClient');

describe('hearing Fee service', () => {

  const mockClaimId = '1645882162449409';
  it('should trigger notify event', async () => {
    //Given
    const spyTriggerEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
    const mockClaim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
    const givenHelpFeeReferenceNumberForm = new ApplyHelpFeesReferenceForm(YesNo.YES, '12345678901');
    const testClaim = {
      ...mockClaim,
      case_data: {
        ...mockClaim.case_data,
        caseProgression: {
          helpFeeReferenceNumberForm: givenHelpFeeReferenceNumberForm,
        },
        isClaimant: jest.fn(),
      },
    };
    //when
    await triggerNotifyEvent(mockClaimId, null, testClaim.case_data);
    //Then
    expect(spyTriggerEvent).toHaveBeenCalled();
    expect(spyTriggerEvent).toHaveBeenCalledWith('APPLY_HELP_WITH_HEARING_FEE', mockClaimId, {'hearingHelpFeesReferenceNumber': '12345678901'}, null);
  });

  it('should trigger notify event even if undefined', async () => {
    //Given
    const spyTriggerEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
    const mockClaim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
    const testClaim = {
      ...mockClaim,
      case_data: {
        ...mockClaim.case_data,
        caseProgression: {
          helpFeeReferenceNumberForm: undefined,
        },
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
