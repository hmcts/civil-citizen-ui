import {CaseState} from 'form/models/claimDetails';
import {
  getHearingDurationAndOtherInformation,
} from 'services/features/caseProgression/trialArrangements/hearingDurationAndOtherInformation';
import {t} from 'i18next';
import {translateCCDCaseDataToCUIModel} from 'services/translation/convertToCUI/cuiTranslation';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {HearingDurationFormatter} from 'services/features/caseProgression/hearingDurationFormatter';

jest.mock('services/features/caseProgression/hearingDurationFormatter');

describe('hearingDurationAndOtherInformation', () => {
  let mockClaim;
  let claimContent: CivilClaimResponse;

  beforeEach(() => {
    mockClaim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
    claimContent = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        caseProgression: {
          defendantTrialArrangements: {
            otherInformation: 'some text',
          },
        },
        caseProgressionHearing:{
          hearingDuration: 'MINUTES_150',
        },
      },
    };
  });

  it('should return all the content', () => {
    //Given
    const mockGetHearingDuration = HearingDurationFormatter.formatHearingDuration as jest.Mock;
    mockGetHearingDuration.mockImplementation( () => {
      return '1 and a half hours';
    });
    const claim = translateCCDCaseDataToCUIModel(claimContent.case_data);

    //when
    const actualHearingDurationContent = getHearingDurationAndOtherInformation(claim, 'en', claimContent.id.toString());

    //Then
    expect(actualHearingDurationContent[0].data.text).toEqual(t('PAGES.TRIAL_DURATION_TRIAL_ARRANGEMENTS.TITLE'));
    expect(actualHearingDurationContent[1].data.text).toEqual(t('COMMON.CLAIM_NUMBER')+': {{claimId}}');
    expect(actualHearingDurationContent[2].data.text).toEqual('COMMON.PARTIES');
    expect(actualHearingDurationContent[3].data.text).toEqual('PAGES.TRIAL_DURATION_TRIAL_ARRANGEMENTS.TRIAL_DURATION_TITLE');
    expect(actualHearingDurationContent[4].data.html).toEqual('<p class="govuk-body">'+t('PAGES.TRIAL_DURATION_TRIAL_ARRANGEMENTS.TRIAL_DURATION_PARAGRAPH', '1 and a half hours')+'</p>');
    expect(actualHearingDurationContent[5].data.text).toEqual('PAGES.TRIAL_DURATION_TRIAL_ARRANGEMENTS.REQUIRE_LESS_TIME');
    expect(actualHearingDurationContent[6].data.html).toEqual('PAGES.TRIAL_DURATION_TRIAL_ARRANGEMENTS.REQUIRE_MORE_TIME');
    expect(actualHearingDurationContent[7].data.text).toEqual('PAGES.TRIAL_DURATION_TRIAL_ARRANGEMENTS.OTHER_INFORMATION_TITLE');
  });
});
