import {Claim} from 'models/claim';
import {
  getClaimantDocuments,
  getCourtDocuments,
  getDefendantDocuments,
} from 'services/features/dashboard/ordersAndNoticesService';
import {
  DocumentInformation,
  DocumentLinkInformation,
  DocumentsViewComponent,
} from 'form/models/documents/DocumentsViewComponent';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {DocumentType} from 'models/document/documentType';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';
import {CaseRole} from 'form/models/caseRoles';
import {Document} from 'models/document/document';
import {ClaimantResponse} from 'models/claimantResponse';

describe('View Orders And Notices Service', () => {

  describe('Get Claimant Documents', () => {
    const claimId = 'test1';
    const documentUrl = '/case/test1/view-documents/71582e35-300e-4294-a604-35d8cabc33de';
    it('should get empty array if there is no data', async () => {
      //given
      const claim = new Claim();
      //When
      const result = getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedResult = new DocumentsViewComponent('Claimant', []);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for claimant dq', async () => {
      //given
      const documentName = 'claimant_test_000MC001.pdf';
      const claim = new Claim();
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.DIRECTIONS_QUESTIONNAIRE);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.CLAIMANT_DQ',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Claimant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for claimant bilingual dq', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.CLAIMANT_INTENTION_TRANSLATED_DOCUMENT);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.CLAIMANT_DQ',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Claimant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for claimant seal claim', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.SEALED_CLAIM);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.SEALED_CLAIM',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Claimant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for claimant bilingual seal claim', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.CLAIM_ISSUE_TRANSLATED_DOCUMENT);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.SEALED_CLAIM',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Claimant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for claimant unseal claim', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.CLAIMANT_CLAIM_FORM);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.UNSEALED_CLAIM',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Claimant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should return empty array for defendant access to claimant unseal claim', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.caseRole = CaseRole.DEFENDANT;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.CLAIMANT_CLAIM_FORM);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedResult = new DocumentsViewComponent('Claimant', []);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for claimant draft claim', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.DRAFT_CLAIM_FORM);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.DRAFT_CLAIM',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Claimant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should return empty array for defendant access to claimant draft claim', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.caseRole = CaseRole.DEFENDANT;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.DRAFT_CLAIM_FORM);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedResult = new DocumentsViewComponent('Claimant', []);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for claimant particulars of claim', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      claim.specParticularsOfClaimDocumentFiles = setUpDocument(documentName);
      claim.submittedDate = new Date('2022-06-21T14:15:19');
      //When
      const result = getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.PARTICULARS_CLAIM',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Claimant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for claimant timeline', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      claim.specClaimTemplateDocumentFiles = setUpDocument(documentName);
      claim.submittedDate = new Date('2022-06-21T14:15:19');
      //When
      const result = getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.CLAIMANT_TIMELINE',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Claimant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for claimant response to defence', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.applicant1DefenceResponseDocumentSpec = {
        file: setUpDocument(documentName),
      };
      claim.claimantResponse.submittedDate = new Date('2022-06-21T14:15:19');
      //When
      const result = getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.RESPOND_TO_DEFENCE',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Claimant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('Get Defendant Documents', () => {
    const claimId = 'test2';
    const documentUrl = '/case/test2/view-documents/71582e35-300e-4294-a604-35d8cabc33de';
    it('should get empty array if there is no data', async () => {
      //given
      const claim = new Claim();
      //When
      const result = getDefendantDocuments(claim, claimId, 'en');
      //Then
      const expectedResult = new DocumentsViewComponent('Defendant', []);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for defendant response', async () => {
      //given
      const documentName = 'test_response_000MC001.pdf';
      const claim = new Claim();
      claim.specRespondent1Represented = YesNoUpperCamelCase.YES;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.SEALED_CLAIM);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = getDefendantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.DEFENDANT_RESPONSE',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Defendant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for defendant lip response', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.specRespondent1Represented = YesNoUpperCamelCase.NO;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.DEFENDANT_DEFENCE);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = getDefendantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.DEFENDANT_RESPONSE',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Defendant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for defendant lip bilingual response', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.specRespondent1Represented = YesNoUpperCamelCase.NO;
      claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.DEFENCE_TRANSLATED_DOCUMENT);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = getDefendantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.DEFENDANT_RESPONSE',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Defendant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for defendant dq', async () => {
      //given
      const documentName = 'defendant_test_000MC001.pdf';
      const claim = new Claim();
      claim.specRespondent1Represented = YesNoUpperCamelCase.NO;
      claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.DIRECTIONS_QUESTIONNAIRE);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = getDefendantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.DEFENDANT_DQ',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Defendant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for support document', async () => {
      //given
      const documentName = 'defendant_test_000MC001.pdf';
      const claim = new Claim();
      claim.specRespondent1Represented = YesNoUpperCamelCase.NO;
      claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.DIRECTIONS_QUESTIONNAIRE);
      claim.defendantResponseDocuments = new Array(document);
      //When
      const result = getDefendantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.DEFENDANT_SUPPORT_DOC',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Defendant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('Get Court Documents', () => {
    const claimId = 'test3';
    it('should get empty array if there is no data', async () => {
      //given
      const claim = new Claim();
      //When
      const result = getCourtDocuments(claim, claimId, 'en');
      //Then
      const expectedResult = new DocumentsViewComponent('CourtDocument', []);
      expect(result).toEqual(expectedResult);
    });
  });

  function setUpMockSystemGeneratedCaseDocument(documentName: string, documentType: DocumentType) {
    return {
      id: '1',
      'value': {
        'createdBy': 'Civil',
        'documentLink': {
          'document_url': 'http://dm-store:8080/documents/71582e35-300e-4294-a604-35d8cabc33de',
          'document_filename': documentName,
          'document_binary_url': 'http://dm-store:8080/documents/71582e35-300e-4294-a604-35d8cabc33de/binary',
        },
        'documentName': documentName,
        'documentSize': 45794,
        'documentType': documentType,
        'createdDatetime': new Date('2022-06-21T14:15:19'),
      },
    };
  }

  function setUpDocument(documentName: string) : Document {
    return {
      document_url: 'http://dm-store:8080/documents/71582e35-300e-4294-a604-35d8cabc33de',
      document_filename: documentName,
      document_binary_url: 'http://dm-store:8080/documents/71582e35-300e-4294-a604-35d8cabc33de/binary',
    };
  }
});
