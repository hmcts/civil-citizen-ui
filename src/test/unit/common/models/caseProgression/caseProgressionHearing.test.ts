import {CaseProgressionHearing, HearingLocation} from 'models/caseProgression/caseProgressionHearing';
import {HearingDuration} from 'models/caseProgression/hearingDuration';
import {t} from 'i18next';
import {HearingFeeInformation} from 'models/caseProgression/hearingFee/hearingFee';
import {HearingDurationFormatter} from 'services/features/caseProgression/hearingDurationFormatter';

jest.mock('../../../../../main/modules/i18n/languageService', ()=> ({
  getLanguage: jest.fn(),
}));

jest.mock('services/features/caseProgression/hearingDurationFormatter');

const hearingLocation =  new HearingLocation(  {
  code: '1',
  label: 'test - test',
});

const fixedDate = new Date(2023, 3, 26);

describe('testing of caseProgressionHearing class', ()=> {
  it('should getHearingTimeHourMinuteFormatted returns with correct information', () => {
    //Given
    const caseProgressionHearing = new CaseProgressionHearing(null, null,null,'1000');
    //When
    const resultHourExpected = caseProgressionHearing.getHearingTimeHourMinuteFormatted();
    //Then
    expect(resultHourExpected).toBe('10:00');
  });

  it('should getHearingDateFormatted returns with correct information', () => {
    //Given
    const caseProgressionHearing = new CaseProgressionHearing(null, null,fixedDate,null);
    //When
    const resultDateExpected = caseProgressionHearing.getHearingDateFormatted('en');
    //Then
    expect(resultDateExpected).toBe('26 April 2023');
  });

  it('should getCourtName returns with correct information', () => {

    const caseProgressionHearing = new CaseProgressionHearing(null, hearingLocation,null,null);
    //When
    const resultCOurtNameExpected = caseProgressionHearing.hearingLocation.getCourtName();
    //Then
    expect(resultCOurtNameExpected).toBe('test');
  });

  it('should getHearingDurationFormatted returns with correct information', () => {
    //Given

    const caseProgressionHearing = new CaseProgressionHearing(null, null,null,null, HearingDuration.MINUTES_180);
    //When
    const resultDateExpected = HearingDurationFormatter.formatHearingDuration(caseProgressionHearing, 'en')
    //Then
    expect(resultDateExpected).toBe(t('COMMON.HEARING_DURATION.'+HearingDuration.MINUTES_180.toString()));
  });

});
describe('testing of caseProgressionHearingFee class', ()=> {
  const caseProgressionHearing = new CaseProgressionHearing(null, null,null,null, null, new HearingFeeInformation({calculatedAmountInPence: '1000', code: 'test', version: '1'}, fixedDate));

  it('should getClaimFeeFormatted returns with correct information', () => {
    //When
    const resultHourExpected = caseProgressionHearing.hearingFeeInformation.getHearingFeeFormatted();
    //Then
    expect(resultHourExpected).toBe(10);
  });

  it('should getHearingDueDateFormated returns with correct information', () => {
    //When
    const resultDateExpected = caseProgressionHearing.hearingFeeInformation.getHearingDueDateFormatted('en');
    //Then
    expect(resultDateExpected).toBe('26 April 2023');
  });
});

describe('CaseProgressionHearing', () => {
  it.each(Object.values(HearingDuration))('should getHearingDurationFormatted returns correct information for %s', (duration) => {
    // Given
    const mockGetHearingDuration = HearingDurationFormatter.formatHearingDuration as jest.Mock;
    const formattedDuration = `COMMON.HEARING_DURATION.${duration}`;
    mockGetHearingDuration.mockImplementation(() => formattedDuration);

    const caseProgressionHearing = new CaseProgressionHearing(null, null, null, null, duration);

    // When
    const result = HearingDurationFormatter.formatHearingDuration(caseProgressionHearing, 'en')

    // Then
    expect(result).toBe(formattedDuration);
  });
});
