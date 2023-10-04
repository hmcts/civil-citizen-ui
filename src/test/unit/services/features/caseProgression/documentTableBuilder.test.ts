import {UploadDocumentTypes, UploadEvidenceDocumentType} from 'models/caseProgression/uploadDocumentsType';
import {EvidenceUploadDisclosure, EvidenceUploadExpert} from 'models/document/documentType';
import {
  orderDocumentByTypeAndNewestToOldest,
  typeValueMap,
} from 'services/features/caseProgression/documentTableBuilder';

describe('orderDocumentByTypeAndNewestToOldest', () => {
  it('Should sort all documents by date and type', () => {
    // Given
    const caseDocument = new UploadEvidenceDocumentType('string', new Date('2022-01-01'), null, new Date('2022-01-01'));
    const caseDocumentAfter = new UploadEvidenceDocumentType('string', new Date('2022-01-02'), null, new Date('2022-01-02'));
    const typeDocument = new UploadDocumentTypes(true, caseDocument, EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE, '123');
    const typeDocumentDisclosureList = new UploadDocumentTypes(true, caseDocumentAfter, EvidenceUploadDisclosure.DISCLOSURE_LIST, '124');
    const typeDocumentExpertReport = new UploadDocumentTypes(true, caseDocumentAfter, EvidenceUploadExpert.EXPERT_REPORT, '125');
    const typeDocumentExpertStatement = new UploadDocumentTypes(true, caseDocument, EvidenceUploadExpert.STATEMENT, '126');

    const documentsDisclosure: UploadDocumentTypes[] = [
      typeDocument,
      typeDocumentDisclosureList,
    ];
    const documentsExpert: UploadDocumentTypes[] = [
      typeDocumentExpertReport,
      typeDocumentExpertStatement,
    ];
    // When
    const sortedDocumentsDisclosure = orderDocumentByTypeAndNewestToOldest(documentsDisclosure);
    const sortedDocumentsExpert = orderDocumentByTypeAndNewestToOldest(documentsExpert);
    // Then
    expect(sortedDocumentsDisclosure).toEqual([
      typeDocumentDisclosureList,
      typeDocument,
    ]);
    expect(sortedDocumentsExpert).toEqual([
      typeDocumentExpertReport,
      typeDocumentExpertStatement,
    ]);
  });
});

describe('typeValueMap test', () => {
  it('should have correct values for specific keys', () => {
    expect(typeValueMap.DOCUMENTS_FOR_DISCLOSURE).toBe(1);
    expect(typeValueMap.DISCLOSURE_LIST).toBe(2);
    expect(typeValueMap.WITNESS_STATEMENT).toBe(3);
    expect(typeValueMap.WITNESS_SUMMARY).toBe(4);
    expect(typeValueMap.NOTICE_OF_INTENTION).toBe(5);
    expect(typeValueMap.DOCUMENTS_REFERRED).toBe(6);
    expect(typeValueMap.EXPERT_REPORT).toBe(7);
    expect(typeValueMap.STATEMENT).toBe(8);
    expect(typeValueMap.QUESTIONS_FOR_EXPERTS).toBe(9);
    expect(typeValueMap.ANSWERS_FOR_EXPERTS).toBe(10);
    expect(typeValueMap.CASE_SUMMARY).toBe(11);
    expect(typeValueMap.SKELETON_ARGUMENT).toBe(12);
    expect(typeValueMap.AUTHORITIES).toBe(13);
    expect(typeValueMap.COSTS).toBe(14);
    expect(typeValueMap.DOCUMENTARY).toBe(15);
  });

  it('should have a value for each key', () => {
    const keys = Object.keys(typeValueMap);
    const values = Object.values(typeValueMap);

    expect(keys.length).toBe(15);
    expect(values.length).toBe(15);
  });
});
