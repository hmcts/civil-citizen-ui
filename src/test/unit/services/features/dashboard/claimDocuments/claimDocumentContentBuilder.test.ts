import {mockClaim} from '../../../../../utils/mockClaim';
import {getCaseProgressionHearingMock} from '../../../../../utils/caseProgression/mockCaseProgressionHearing';
import {
  buildDownloadHearingNoticeSection,
  buildDownloadSealedClaimSection,
} from '../../../../../../main/services/features/dashboard/claimDocuments/claimDocumentContentBuilder';
import {CASE_DOCUMENT_DOWNLOAD_URL} from '../../../../../../main/routes/urls';
import {DocumentUri} from '../../../../../../main/common/models/document/documentType';

describe('Claim document content builder', ()=>{
  it('should return json with document size in KB and link to download the pdf', ()=>{
    //When
    const claimDocumentSection = buildDownloadSealedClaimSection(mockClaim, '1', 'eng');
    //Then
    expect(claimDocumentSection).not.toBeUndefined();
    expect(claimDocumentSection.data?.href).toBe(CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', '1').replace(':documentType', DocumentUri.SEALED_CLAIM));
    expect(claimDocumentSection.data?.text).toContain('45 KB');
    expect(claimDocumentSection.data?.subtitle).toContain('21 June 2022');
  });
});

describe('Hearing Notice document content builder', ()=>{
  it('should return nothing as correct information missing', ()=>{
    //When
    const hearingNocticeSection = buildDownloadHearingNoticeSection(mockClaim, '1', 'eng');
    //Then
    expect(hearingNocticeSection).toBeUndefined();
  });

  it('should return json with document size in KB and link to download the pdf', ()=>{
    //given
    mockClaim.caseProgressionHearing = getCaseProgressionHearingMock();
    //When
    const hearingNocticeSection = buildDownloadHearingNoticeSection(mockClaim, '1', 'eng');
    //Then
    expect(hearingNocticeSection).not.toBeUndefined();
    expect(hearingNocticeSection.data?.href).toBe(CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', '1').replace(':documentType', DocumentUri.HEARING_FORM));
    expect(hearingNocticeSection.data?.text).toContain('55 KB');
    expect(hearingNocticeSection.data?.subtitle).toContain('21 June 2022');
  });
});
