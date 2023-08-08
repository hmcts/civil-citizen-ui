import {CaseProgressionHearing, HearingLocation} from 'models/caseProgression/caseProgressionHearing';
import {HearingDuration} from 'models/caseProgression/hearingDuration';
import {t} from 'i18next';

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
    const resultDateExpected = caseProgressionHearing.getHearingDurationFormatted();
    //Then
    expect(resultDateExpected).toBe(t('COMMON.HEARING_DURATION.'+HearingDuration.MINUTES_180.toString()));
  });

});
