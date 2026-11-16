import {
  CaseProgressionHearing,
  HearingLocation,
} from 'models/caseProgression/caseProgressionHearing';
import {HearingDuration} from 'models/caseProgression/hearingDuration';
import {t} from 'i18next';
import {HearingFeeInformation} from 'models/caseProgression/hearingFee/hearingFee';
import {HearingDurationFormatter} from 'services/features/caseProgression/hearingDurationFormatter';

jest.mock('../../../../../main/modules/i18n/languageService', ()=> ({
  getLanguage: jest.fn(),
}));

jest.mock('services/features/caseProgression/hearingDurationFormatter');

jest.mock('@hmcts/nodejs-logging', () => {
  const logger = {warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn()};
  return {Logger: {getLogger: () => logger}};
});
const mockLogger = require('@hmcts/nodejs-logging').Logger.getLogger();

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
    const resultDateExpected = HearingDurationFormatter.formatHearingDuration(caseProgressionHearing, 'en');
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

describe('testing of caseProgressionHearing class with missing values', () => {
  const caseProgressionHearing = new CaseProgressionHearing();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty string and log warning for hearing time when not set', () => {
    expect(caseProgressionHearing.getHearingTimeHourMinuteFormatted()).toBe('');
    expect(mockLogger.warn).toHaveBeenCalledWith('[CaseProgressionHearing.getHearingTimeHourMinuteFormatted] hearingTimeHourMinute missing, returning empty string');
  });

  it('should return empty string and log warning for hearing date when not set', () => {
    expect(caseProgressionHearing.getHearingDateFormatted('en')).toBe('');
    expect(mockLogger.warn).toHaveBeenCalledWith('[CaseProgressionHearing.getHearingDateFormatted] hearingDate missing, returning empty string');
  });

  it('should return empty string and log warning for court name when location value not set', () => {
    expect(new HearingLocation().getCourtName()).toBe('');
    expect(mockLogger.warn).toHaveBeenCalledWith('[HearingLocation.getCourtName] hearing location label missing, returning empty court name');
  });

  it('should return undefined for duration of days when hearing date not set', () => {
    expect(caseProgressionHearing.getDurationOfDaysForHearing()).toBeUndefined();
  });
});

describe('testing of getDurationOfDaysForHearing', () => {
  it('should return number of days until the hearing date', () => {
    //Given
    const hearingDate = new Date();
    hearingDate.setDate(hearingDate.getDate() + 5);
    const caseProgressionHearing = new CaseProgressionHearing(null, null, hearingDate, null);
    //When
    const result = caseProgressionHearing.getDurationOfDaysForHearing();
    //Then
    expect(result).toBe(5);
  });
});

describe('testing of caseProgressionHearingFee class with missing values', () => {
  const hearingFeeInformation = new HearingFeeInformation();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return undefined and log warning for hearing fee when not set', () => {
    expect(hearingFeeInformation.getHearingFeeFormatted()).toBeUndefined();
    expect(mockLogger.warn).toHaveBeenCalledWith('[HearingFeeInformation.getHearingFeeFormatted] calculatedAmountInPence missing, returning undefined');
  });

  it('should return zero for hearing fee when amount is zero without logging', () => {
    const zeroFeeInformation = new HearingFeeInformation({calculatedAmountInPence: '0', code: 'test', version: '1'});
    expect(zeroFeeInformation.getHearingFeeFormatted()).toBe(0);
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it('should return undefined and log warning for hearing due date when not set', () => {
    expect(hearingFeeInformation.getHearingDueDateFormatted('en')).toBeUndefined();
    expect(mockLogger.warn).toHaveBeenCalledWith('[HearingFeeInformation.getHearingDueDateFormatted] hearingDueDate missing, returning undefined');
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
    const result = HearingDurationFormatter.formatHearingDuration(caseProgressionHearing, 'en');

    // Then
    expect(result).toBe(formattedDuration);
  });
});
