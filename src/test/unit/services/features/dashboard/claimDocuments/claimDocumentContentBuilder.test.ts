import {mockClaim} from '../../../../../utils/mockClaim';
import {
  buildDownloadSealedClaimSection,
} from 'services/features/dashboard/claimDocuments/claimDocumentContentBuilder';
import {CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';

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
