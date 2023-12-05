import {HearingDateTimeFormatter} from 'services/features/caseProgression/hearingDateTimeFormatter';

describe('HearingDateTimeFormatter Service', () => {
  it('should format Hearing Time Hour Minute correctly', async () => {
    //Given
    const hearingTimeHourMinute = '1000';
    const hearingTimeHourMinuteExpected = '10:00';
    //When
    const hearingTimeHourMinuteResult = HearingDateTimeFormatter.getHearingTimeHourMinuteFormatted(hearingTimeHourMinute);
    //Then
    expect(hearingTimeHourMinuteExpected).toEqual(hearingTimeHourMinuteResult);
  });
  it('should format Hearing Date Formatted correctly', async () => {
    //Given
    const hearingDate = new Date(2022, 10, 31);
    const hearingDateExpected = '1 December 2022';
    //When
    const hearingDateResult = HearingDateTimeFormatter.getHearingDateFormatted(hearingDate, 'en');
    //Then
    expect(hearingDateExpected).toEqual(hearingDateResult);
  });
});
