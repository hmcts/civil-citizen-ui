import {
  CaseProgressionHearing,
  CaseProgressionHearingDocuments,
  HearingLocation,
} from 'models/caseProgression/caseProgressionHearing';
import {FIXED_DATE, FIXED_TIME_HOUR_MINUTE} from '../dateUtils';
import {DocumentType} from 'models/document/documentType';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {TrialArrangements, TrialArrangementsDocument} from 'models/caseProgression/trialArrangements/trialArrangements';
const hearingLocation = new HearingLocation({code: '1', label: 'test - test'});
export const getCaseProgressionHearingMock = (): CaseProgressionHearing => {
  return new CaseProgressionHearing(getCaseProgressionHearingDocuments(),hearingLocation, FIXED_DATE, FIXED_TIME_HOUR_MINUTE);
};

export const getCaseProgressionTrialArrangementsMock = (isClaimant: boolean): CaseProgression => {
  return getCaseProgressionWithTrialArrangementsDocument(isClaimant);
};

function getCaseProgressionWithTrialArrangementsDocument(isClaimant: boolean): CaseProgression {
  const caseProgression = new CaseProgression();
  const trialArrangements: TrialArrangements = new TrialArrangements();
  if (isClaimant) {
    const trialArrangementsDocument = new TrialArrangementsDocument();
    trialArrangementsDocument.id = '1234';
    trialArrangementsDocument.value = {
      'createdBy': 'Civil',
      'documentLink': {
        'document_url': 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab5',
        'document_filename': 'claimant_Clark_21_June_2022_Trial_Arrangements.pdf',
        'document_binary_url': 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab5/binary',
      },
      'documentName': 'claimant_Clark_21_June_2022_Trial_Arrangements.pdf',
      'documentSize': 56461,
      documentType: DocumentType.TRIAL_READY_DOCUMENT,
      createdDatetime: new Date('2022-06-21T14:15:19'),
    };
    trialArrangements.trialArrangementsDocument = trialArrangementsDocument;
    caseProgression.claimantTrialArrangements = trialArrangements;
  } else {
    const trialArrangementsDocument = new TrialArrangementsDocument();
    trialArrangementsDocument.id = '2345';
    trialArrangementsDocument.value = {
      'createdBy': 'Civil',
      'documentLink': {
        'document_url': 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab2',
        'document_filename': 'defendant_Richards_21_June_2022_Trial_Arrangements.pdf',
        'document_binary_url': 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab2/binary',
      },
      'documentName': 'defendant_Richards_21_June_2022_Trial_Arrangements.pdf',
      'documentSize': 56461,
      documentType: DocumentType.TRIAL_READY_DOCUMENT,
      createdDatetime: new Date('2022-06-21T14:15:19'),
    };
    trialArrangements.trialArrangementsDocument = trialArrangementsDocument;
    caseProgression.defendantTrialArrangements = trialArrangements;
  }
  return caseProgression;
}

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
