import {mockClaim} from '../../../../../utils/mockClaim';
import {getCaseProgressionHearingMock} from '../../../../../utils/caseProgression/mockCaseProgressionHearing';
import {
  buildDownloadHearingNoticeSection,
  buildDownloadSealedClaimSection,
} from 'services/features/dashboard/claimDocuments/claimDocumentContentBuilder';
import {CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';
import {DocumentType} from 'models/document/documentType';

describe('Claim document content builder', ()=>{
  it('should return json with document size in KB and link to download the pdf', ()=>{
    //When
    const claimDocumentSection = buildDownloadSealedClaimSection(mockClaim, '1', 'eng');
    //Then
    expect(claimDocumentSection).not.toBeUndefined();
    expect(claimDocumentSection.data?.href).toBe(CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', '1').replace(':documentId', '71582e35-300e-4294-a604-35d8cabc33de'));
    expect(claimDocumentSection.data?.text).toContain('45 KB');
    expect(claimDocumentSection.data?.subtitle).toContain('21 June 2022');
  });
});

describe('Hearing Notice document content builder', ()=>{
  it('should return nothing if correct information missing', ()=>{
    //When
    const hearingNoticeSection = buildDownloadHearingNoticeSection(mockClaim, '1', 'eng');
    //Then
    expect(hearingNoticeSection).toBeUndefined();
  });

  it('should return json with document size in KB and link to download the pdf', ()=>{
    //given
    mockClaim.caseProgressionHearing = getCaseProgressionHearingMock();
    //When
    const hearingNoticeSection = buildDownloadHearingNoticeSection(mockClaim, '1', 'eng');
    //Then
    expect(hearingNoticeSection).not.toBeUndefined();
    expect(hearingNoticeSection.data?.href).toBe(CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', '1').replace(':documentType', getSystemGeneratedCaseDocumentIdByType(mockClaim.systemGeneratedCaseDocuments, DocumentType.HEARING_FORM)));
    expect(hearingNoticeSection.data?.text).toContain('55 KB');
    expect(hearingNoticeSection.data?.subtitle).toContain('21 June 2022');
  });
});
