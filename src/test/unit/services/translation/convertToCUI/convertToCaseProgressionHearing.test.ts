import {
  CaseProgressionHearing,
  CaseProgressionHearingDocuments,
  HearingLocation,
} from 'models/caseProgression/caseProgressionHearing';
import {toCUICaseProgressionHearing} from 'services/translation/convertToCUI/convertToCaseProgressionHearing';
import {FIXED_DATE, FIXED_TIME_HOUR_MINUTE} from '../../../../utils/dateUtils';
import {DocumentType} from 'models/document/documentType';
import {CCDClaim} from 'models/civilClaimResponse';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {HearingFeeInformation} from 'models/caseProgression/hearingFee';

jest.mock('../../../../../main/modules/i18n/languageService', () => ({
  getLanguage: jest.fn().mockReturnValue('en'),
  setLanguage: jest.fn(),
}));

describe('toCUICaseProgressionHearing', () => {
  it('should convert CCDClaim to CaseProgressionHearing', () => {
    const hearingLocation = new HearingLocation({code: '1', label: 'test - test'});

    const ccdClaim: CCDClaim = {
      hearingDocuments: getCaseProgressionHearingDocuments(),
      hearingDate: FIXED_DATE,
      hearingLocation: hearingLocation,
      hearingTimeHourMinute: FIXED_TIME_HOUR_MINUTE,
      trialReadyApplicant: YesNoUpperCamelCase.NO,
      trialReadyRespondent1: YesNoUpperCamelCase.YES,
      hearingFee: {
        calculatedAmountInPence: '100',
        code: 'test',
        version: '1',
      },
      hearingDueDate: FIXED_DATE,
    };
    const expectedOutput = new CaseProgressionHearing(getCaseProgressionHearingDocuments(),hearingLocation, FIXED_DATE, FIXED_TIME_HOUR_MINUTE,undefined, new HearingFeeInformation(ccdClaim.hearingFee, ccdClaim.hearingDueDate));

    const actualOutput = toCUICaseProgressionHearing(ccdClaim);
    expect(actualOutput).toEqual(expectedOutput);
  });

  it('should return undefined when CCDClaim is undefined', () => {
    const ccdClaim:CCDClaim = undefined;
    const expectedOutput:CCDClaim = undefined;
    const actualOutput = toCUICaseProgressionHearing(ccdClaim);
    expect(actualOutput).toEqual(expectedOutput);
  });

  it('should handle null or undefined properties of CCDClaim', () => {
    const ccdClaim: CCDClaim = {
      hearingDocuments: undefined,
      hearingDate: undefined,
      hearingLocation: undefined,
      hearingTimeHourMinute: undefined,
      hearingFee: undefined,
      hearingDueDate: undefined,
    };
    const expectedOutput: CaseProgressionHearing = new CaseProgressionHearing(
      undefined,new HearingLocation(undefined),undefined,undefined, undefined, new HearingFeeInformation(undefined, undefined));
    const actualOutput = toCUICaseProgressionHearing(ccdClaim);
    expect(actualOutput).toEqual(expectedOutput);
  });
});

function getCaseProgressionHearingDocuments(): CaseProgressionHearingDocuments[] {
  const caseProgressionHearingDocuments = new CaseProgressionHearingDocuments();
  caseProgressionHearingDocuments.id = '1221';
  caseProgressionHearingDocuments.value = {
    'createdBy': 'Civil',
    'documentLink': {
      'document_url': 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6',
      'document_filename': 'hearing_small_claim_000MC110.pdf',
      'document_binary_url': 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6/binary',
    },
    'documentName': 'hearing_small_claim_000MC110.pdf',
    'documentSize': 56461,
    documentType: DocumentType.HEARING_FORM,
    createdDatetime: new Date('2022-06-21T14:15:19'),
  };
  return [caseProgressionHearingDocuments];
}

