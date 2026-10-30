import {
  CaseProgressionHearing,
  CaseProgressionHearingDocuments,
  getHearingDocumentsCaseDocumentIdByType,
  HearingLocation,
} from 'models/caseProgression/caseProgressionHearing';
import {DocumentType} from 'models/document/documentType';
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

  it('should return empty string for hearing time when not set', () => {
    expect(caseProgressionHearing.getHearingTimeHourMinuteFormatted()).toBe('');
  });

  it('should return empty string for hearing date when not set', () => {
    expect(caseProgressionHearing.getHearingDateFormatted('en')).toBe('');
  });

  it('should return empty string for court name when location value not set', () => {
    expect(new HearingLocation().getCourtName()).toBe('');
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

describe('testing of getHearingDocumentsCaseDocumentIdByType', () => {
  const hearingDocuments = [{
    id: '1',
    value: {
      documentType: DocumentType.HEARING_FORM,
      documentName: 'hearing_form.pdf',
      documentLink: {document_url: 'url', document_filename: 'hearing_form.pdf', document_binary_url: 'http://dm-store/documents/abc-123/binary'},
    },
  }] as unknown as CaseProgressionHearingDocuments[];

  it('should return document id when document of type exists', () => {
    expect(getHearingDocumentsCaseDocumentIdByType(hearingDocuments, DocumentType.HEARING_FORM)).toBe('abc-123');
  });

  it('should return null when no document of type exists', () => {
    expect(getHearingDocumentsCaseDocumentIdByType(hearingDocuments, DocumentType.JUDGE_FINAL_ORDER)).toBeNull();
  });

  it('should return undefined when no hearing documents', () => {
    expect(getHearingDocumentsCaseDocumentIdByType([], DocumentType.HEARING_FORM)).toBeUndefined();
  });
});

describe('testing of caseProgressionHearingFee class with missing values', () => {
  const hearingFeeInformation = new HearingFeeInformation();

  it('should return undefined for hearing fee when not set', () => {
    expect(hearingFeeInformation.getHearingFeeFormatted()).toBeUndefined();
  });

  it('should return zero for hearing fee when amount is zero', () => {
    const zeroFeeInformation = new HearingFeeInformation({calculatedAmountInPence: '0', code: 'test', version: '1'});
    expect(zeroFeeInformation.getHearingFeeFormatted()).toBe(0);
  });

  it('should return undefined for hearing due date when not set', () => {
    expect(hearingFeeInformation.getHearingDueDateFormatted('en')).toBeUndefined();
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
