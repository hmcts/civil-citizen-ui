import {mockClaim} from '../../../../../utils/mockClaim';
import {CASE_DOCUMENT_DOWNLOAD_URL} from '../../../../../../main/routes/urls';
import {
  getFinalOrderDocumentCollectionMock,
} from '../../../../../utils/caseProgression/mockCCDFinalOrderDocumentCollection';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {t} from 'i18next';
import {
  buildDownloadFinalOrderSection,
} from 'services/features/dashboard/finalOrderDocuments/finalOrderDocumentContentBuilder';

describe('Final Order Document Collection content builder', ()=>{
  it('should return json with document size in KB and link to download the pdf for finalOrderDocumentCollection', ()=>{
    //Given
    mockClaim.caseProgression = new CaseProgression();
    mockClaim.caseProgression.finalOrderDocumentCollection = [getFinalOrderDocumentCollectionMock()];
    //When
    const finalOrderSection = buildDownloadFinalOrderSection(mockClaim, '1', 'eng');
    //Then
    expect(finalOrderSection[0].data.text).toBe(t('PAGES.CLAIM_SUMMARY.ORDERS', { lng: 'eng' }));
    expect(finalOrderSection[1]).not.toBeUndefined();
    expect(finalOrderSection[1].data?.href).toBe(CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', '1').replace(':documentId', '20712d13-18c2-4779-b1f4-8b7d3e0312b9'));
    expect(finalOrderSection[1].data?.text).toContain('21 KB');
    expect(finalOrderSection[1].data?.subtitle).toContain('26 April 2023');
  });
});
