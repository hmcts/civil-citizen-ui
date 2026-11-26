import {Claim} from 'models/claim';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';
import {DocumentType} from 'models/document/documentType';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {
  resolveOrderDocumentId,
  resolveViewableOrderDocumentId,
} from 'services/features/dashboard/bilingualOrderDocumentService';

const doc = (type: DocumentType, binaryUrl: string) => ({
  id: '1',
  value: {
    documentType: type,
    documentLink: {document_binary_url: binaryUrl, document_url: 'u', document_filename: 'f.pdf'},
  },
});

describe('resolveOrderDocumentId (OCCC-827)', () => {
  it('returns English SDO for English claimant', () => {
    const claim = new Claim();
    claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.ENGLISH;
    claim.systemGeneratedCaseDocuments = [
      doc(DocumentType.SDO_ORDER, 'http://dm/documents/en-sdo/binary') as any,
      doc(DocumentType.SDO_TRANSLATED_DOCUMENT, 'http://dm/documents/cy-sdo/binary') as any,
    ];

    expect(resolveOrderDocumentId(claim, true, 'SDO')).toBe('en-sdo');
  });

  it('returns Welsh SDO for Welsh claimant', () => {
    const claim = new Claim();
    claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH;
    claim.systemGeneratedCaseDocuments = [
      doc(DocumentType.SDO_ORDER, 'http://dm/documents/en-sdo/binary') as any,
      doc(DocumentType.SDO_TRANSLATED_DOCUMENT, 'http://dm/documents/cy-sdo/binary') as any,
    ];

    expect(resolveOrderDocumentId(claim, true, 'SDO')).toBe('cy-sdo');
  });

  it('returns bilingual SDO for BOTH preference', () => {
    const claim = new Claim();
    claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
    claim.systemGeneratedCaseDocuments = [
      doc(DocumentType.SDO_ORDER, 'http://dm/documents/en-sdo/binary') as any,
      doc(DocumentType.SDO_TRANSLATED_DOCUMENT, 'http://dm/documents/cy-sdo/binary') as any,
      doc(DocumentType.SDO_BILINGUAL_DOCUMENT, 'http://dm/documents/bi-sdo/binary') as any,
    ];

    expect(resolveOrderDocumentId(claim, true, 'SDO')).toBe('bi-sdo');
  });

  it('returns undefined for Welsh claimant when translated SDO missing', () => {
    const claim = new Claim();
    claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH;
    claim.systemGeneratedCaseDocuments = [
      doc(DocumentType.SDO_ORDER, 'http://dm/documents/en-sdo/binary') as any,
    ];

    expect(resolveOrderDocumentId(claim, true, 'SDO')).toBeUndefined();
  });

  it('returns bilingual final order for BOTH defendant', () => {
    const claim = new Claim();
    claim.respondent1LiPResponse = {respondent1ResponseLanguage: 'BOTH'} as any;
    claim.caseProgression = new CaseProgression();
    claim.caseProgression.finalOrderDocumentCollection = [
      doc(DocumentType.JUDGE_FINAL_ORDER, 'http://dm/documents/en-order/binary') as any,
      doc(DocumentType.FINAL_ORDER_TRANSLATED_DOCUMENT, 'http://dm/documents/cy-order/binary') as any,
      doc(DocumentType.FINAL_ORDER_BILINGUAL_DOCUMENT, 'http://dm/documents/bi-order/binary') as any,
    ];

    expect(resolveOrderDocumentId(claim, false, 'FINAL_ORDER')).toBe('bi-order');
  });

  it('ignores Welsh preference when welshEnabled is false', () => {
    const claim = new Claim();
    claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH;
    claim.systemGeneratedCaseDocuments = [
      doc(DocumentType.SDO_ORDER, 'http://dm/documents/en-sdo/binary') as any,
      doc(DocumentType.SDO_TRANSLATED_DOCUMENT, 'http://dm/documents/cy-sdo/binary') as any,
    ];

    expect(resolveOrderDocumentId(claim, true, 'SDO', false)).toBe('en-sdo');
  });

  it('resolveViewableOrderDocumentId falls back to SDO when no final order exists', () => {
    const claim = new Claim();
    claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.ENGLISH;
    claim.systemGeneratedCaseDocuments = [
      doc(DocumentType.SDO_ORDER, 'http://dm/documents/en-sdo/binary') as any,
    ];

    expect(resolveViewableOrderDocumentId(claim, true)).toBe('en-sdo');
  });

  it('returns bilingual hearing notice for BOTH preference', () => {
    const claim = new Claim();
    claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
    claim.caseProgressionHearing = {
      hearingDocuments: [
        doc(DocumentType.HEARING_FORM, 'http://dm/documents/en-hearing/binary') as any,
        doc(DocumentType.HEARING_NOTICE_BILINGUAL_DOCUMENT, 'http://dm/documents/bi-hearing/binary') as any,
      ],
      hearingDocumentsWelsh: [
        doc(DocumentType.TRANSLATED_HEARING_NOTICE, 'http://dm/documents/cy-hearing/binary') as any,
      ],
    } as any;

    expect(resolveOrderDocumentId(claim, true, 'HEARING_NOTICE')).toBe('bi-hearing');
  });

  it('returns Welsh hearing notice for Welsh preference', () => {
    const claim = new Claim();
    claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH;
    claim.caseProgressionHearing = {
      hearingDocuments: [
        doc(DocumentType.HEARING_FORM, 'http://dm/documents/en-hearing/binary') as any,
      ],
      hearingDocumentsWelsh: [
        doc(DocumentType.TRANSLATED_HEARING_NOTICE, 'http://dm/documents/cy-hearing/binary') as any,
      ],
    } as any;

    expect(resolveOrderDocumentId(claim, true, 'HEARING_NOTICE')).toBe('cy-hearing');
  });
});
