import {CaseProgressionHearing, HearingLocation} from 'models/caseProgression/caseProgressionHearing';
jest.mock('../../../../../main/modules/i18n/languageService', ()=> ({
  getLanguage: jest.fn(),
}));

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
    const resultDateExpected = caseProgressionHearing.getHearingDateFormatted();
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
});
