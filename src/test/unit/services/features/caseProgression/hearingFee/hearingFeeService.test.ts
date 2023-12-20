import {triggerNotifyEvent} from 'services/features/caseProgression/hearingFee/hearingFeeService';
import {CivilServiceClient} from 'client/civilServiceClient';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {ApplyHelpFeesReferenceForm} from 'form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm';
import {CCDHelpWithFees} from 'form/models/claimDetails';

jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('services/translation/claim/ccdTranslation');
jest.mock('client/civilServiceClient');

describe('hearing Fee service', () => {

  const mockClaimId = '1645882162449409';
  it('should trigger notify event', async () => {
    //Given
    const spyTriggerEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
    const mockClaim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
    const givenHelpFeeReferenceNumberForm = new ApplyHelpFeesReferenceForm(YesNo.YES, '12341234123');
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
    const expectedHelpFeeReferenceNumberForm = {hearingFeeHelpWithFees: {helpWithFee: YesNoUpperCamelCase.YES, helpWithFeesReferenceNumber: '12341234123'} as CCDHelpWithFees};
    expect(spyTriggerEvent).toHaveBeenCalled();
    expect(spyTriggerEvent).toHaveBeenCalledWith('NOTIFY_CLAIMANT_LIP_HELP_WITH_FEES', mockClaimId, expectedHelpFeeReferenceNumberForm, null);
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
    expect(spyTriggerEvent).toHaveBeenCalledWith('NOTIFY_CLAIMANT_LIP_HELP_WITH_FEES', mockClaimId, {hearingFeeHelpWithFees: undefined}, null);
  });
});
