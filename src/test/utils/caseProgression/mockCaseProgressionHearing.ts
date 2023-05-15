import {
  CaseProgressionHearing,
  CaseProgressionHearingDocuments,
  HearingLocation,
} from 'models/caseProgression/caseProgressionHearing';
import {FIXED_DATE, FIXED_TIME_HOUR_MINUTE} from '../dateUtils';
import {DocumentType} from 'models/document/documentType';
const hearingLocation = new HearingLocation({code: '1', label: 'test - test'});
export const getCaseProgressionHearingMock = (): CaseProgressionHearing => {
  return new CaseProgressionHearing(getCaseProgressionHearingDocuments(),hearingLocation, FIXED_DATE, FIXED_TIME_HOUR_MINUTE);
};

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
