import {mockClaim} from '../../../../../utils/mockClaim';
import {
  buildSystemGeneratedDocumentSections,
  buildDownloadSealedResponseSection,
} from 'services/features/dashboard/claimDocuments/claimDocumentContentBuilder';
import {CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';
import {DocumentUri} from 'common/models/document/documentType';

describe('Claim document content builder', ()=>{
  it('should return json with document size in KB and link to download the pdf', ()=>{
    //When
    const claimDocumentSection = buildSystemGeneratedDocumentSections(mockClaim, '1', 'eng');
    //Then
    expect(claimDocumentSection).not.toBeUndefined();
    expect(claimDocumentSection[0].data?.href).toBe(CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', '1').replace(':documentId', '71582e35-300e-4294-a604-35d8cabc33de'));
    expect(claimDocumentSection[0].data?.text).toContain('45 KB');
    expect(claimDocumentSection[0].data?.subtitle).toContain('21 June 2022');
  });

  it('should return json with document size in KB and link to defendant response pdf', ()=>{
    //When
    const claimDocumentSection = buildDownloadSealedResponseSection(mockClaim, '2', 'eng');
    //Then
    expect(claimDocumentSection).not.toBeUndefined();
    expect(claimDocumentSection.data?.href).toBe(CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', '2').replace(':documentId', '7f092465-658e-4ec1-af30-b5551b5260b4').replace(':documentType', DocumentUri.DEFENDANT_DEFENCE));
    expect(claimDocumentSection.data?.text).toContain('33 KB');
    expect(claimDocumentSection.data?.subtitle).toContain('22 June 2022');
  });
});
