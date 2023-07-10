import {mockClaim} from '../../../../../utils/mockClaim';
import {
  buildDownloadSealedClaimSection,
  buildDownloadSealedResponseSection,
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

  it('should return json with document size in KB and link to defendant response pdf', ()=>{
    //When
    const claimDocumentSection = buildDownloadSealedResponseSection(mockClaim, '2', 'eng');
    //Then
    expect(claimDocumentSection).not.toBeUndefined();
    expect(claimDocumentSection.data?.href).toBe(CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', '2').replace(':documentType', DocumentUri.DEFENDANT_DEFENCE));
    expect(claimDocumentSection.data?.text).toContain('33 KB');
    expect(claimDocumentSection.data?.subtitle).toContain('22 June 2022');
  });
});
